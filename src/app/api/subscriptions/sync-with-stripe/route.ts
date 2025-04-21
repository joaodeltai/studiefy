import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import { stripe, determinePlan, determinePeriod } from '@/lib/stripe';
import { SubscriptionPlan, SubscriptionStatus } from '@/types/subscription';

/**
 * Endpoint para sincronizar manualmente uma assinatura com o Stripe
 * 
 * Este endpoint permite sincronizar os dados de uma assinatura no banco de dados
 * com os dados mais recentes do Stripe. É útil quando os dados estão desatualizados
 * ou quando o webhook não processou corretamente um evento.
 * 
 * Requer autenticação como administrador.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClientWithCookies();
    const { userId, stripeSubscriptionId } = await req.json();

    // Verificar se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Você precisa estar autenticado para usar esta API' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é administrador
    // Você pode ajustar esta verificação conforme sua lógica de administração
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || 
                    profile?.email === process.env.ADMIN_EMAIL ||
                    user.email === process.env.ADMIN_EMAIL;

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Você não tem permissão para usar esta API' },
        { status: 403 }
      );
    }

    // Verificar se os parâmetros necessários foram fornecidos
    if (!userId || !stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'ID do usuário e ID da assinatura no Stripe são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o cliente Stripe está inicializado
    if (!stripe) {
      return NextResponse.json(
        { error: 'Cliente Stripe não inicializado' },
        { status: 500 }
      );
    }

    // Buscar a assinatura no Stripe
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada no Stripe' },
        { status: 404 }
      );
    }

    // Determinar o plano com base no ID do preço
    const priceId = subscription.items.data[0].price.id;
    const plan = determinePlan(priceId);
    const period = determinePeriod(priceId);

    // Buscar o profile_id do usuário
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profileData) {
      return NextResponse.json(
        { error: `Perfil não encontrado para o usuário ${userId}` },
        { status: 404 }
      );
    }

    // Verificar se a assinatura já existe no banco de dados
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    let result;

    if (existingSubscription) {
      // Atualizar a assinatura existente
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          status: subscription.status as SubscriptionStatus,
          plan: plan as SubscriptionPlan,
          period,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Erro ao atualizar assinatura: ${error.message}` },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Criar uma nova assinatura
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          profile_id: profileData.id,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          status: subscription.status as SubscriptionStatus,
          plan: plan as SubscriptionPlan,
          period,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Erro ao criar assinatura: ${error.message}` },
          { status: 500 }
        );
      }

      result = data;
    }

    // Atualizar o plano de assinatura no perfil do usuário
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ subscription_plan: plan })
      .eq('user_id', userId);

    if (profileError) {
      return NextResponse.json(
        { error: `Erro ao atualizar perfil: ${profileError.message}`, subscription: result },
        { status: 500 }
      );
    }

    // Registrar a sincronização no log de assinaturas
    const { error: logError } = await supabase
      .from('subscription_logs')
      .insert({
        user_id: userId,
        subscription_id: result.id,
        old_status: existingSubscription?.status || null,
        new_status: subscription.status,
        old_plan: existingSubscription?.plan || null,
        new_plan: plan,
        reason: 'Sincronização manual com o Stripe',
        processed_by: `admin:${user.id}`
      });

    if (logError) {
      console.error('Erro ao registrar log de assinatura:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Assinatura sincronizada com sucesso',
      subscription: result
    });
  } catch (error: any) {
    console.error('Erro ao sincronizar assinatura:', error);
    return NextResponse.json(
      { error: `Erro ao sincronizar assinatura: ${error.message}` },
      { status: 500 }
    );
  }
}
