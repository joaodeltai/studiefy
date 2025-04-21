import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies as createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { SubscriptionStatus } from '@/types/subscription';

/**
 * API para obter detalhes de uma assinatura especu00edfica
 * 
 * Esta API u00e9 usada pela pu00e1gina de administrau00e7u00e3o para obter detalhes
 * completos de uma assinatura, incluindo dados do Stripe e do banco de dados.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o usuu00e1rio estu00e1 autenticado e u00e9 administrador
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Nu00e3o autorizado. Fau00e7a login para continuar.' },
        { status: 401 }
      );
    }
    
    // Verificar se o usuu00e1rio u00e9 administrador
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', session.user.id)
      .single();
    
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || !profile || !adminEmail.split(',').includes(profile.email)) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta API.' },
        { status: 403 }
      );
    }
    
    // Obter o ID da assinatura dos paru00e2metros
    const subscriptionId = params.id;
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'ID da assinatura nu00e3o fornecido' },
        { status: 400 }
      );
    }
    
    // Buscar a assinatura no banco de dados
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*, profiles(email, full_name)')
      .eq('id', subscriptionId)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Erro ao buscar assinatura no banco de dados', details: error.message },
        { status: 500 }
      );
    }
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Assinatura nu00e3o encontrada' },
        { status: 404 }
      );
    }
    
    // Se tiver ID do Stripe, buscar informau00e7u00f5es adicionais
    let stripeData = null;
    if (subscription.stripe_subscription_id && stripe) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        
        stripeData = {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          cancel_at: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000).toISOString() : null,
          canceled_at: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000).toISOString() : null,
          items: stripeSubscription.items.data.map(item => ({
            id: item.id,
            price: item.price.id,
            product: item.price.product
          }))
        };
      } catch (stripeError: any) {
        console.error('Erro ao buscar assinatura no Stripe:', stripeError);
        stripeData = { error: stripeError.message };
      }
    }
    
    // Buscar histu00f3rico de logs da assinatura
    const { data: logs } = await supabase
      .from('subscription_logs')
      .select('*')
      .eq('user_id', subscription.user_id)
      .order('changed_at', { ascending: false });
    
    // Retornar os dados completos
    return NextResponse.json({
      success: true,
      subscription: {
        ...subscription,
        stripe_data: stripeData,
        logs: logs || []
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao buscar detalhes da assinatura:', error);
    
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes da assinatura', details: error.message },
      { status: 500 }
    );
  }
}
