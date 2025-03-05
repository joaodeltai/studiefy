import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '../../../../lib/supabase/server';
import { stripe } from '../../../../lib/stripe';
import { SubscriptionStatus } from '../../../../types/subscription';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClientWithCookies();

    // Verifica se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    console.log(`Cancelando assinatura para o usuário ${user.id}`);

    // Busca a assinatura do usuário no banco de dados
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar assinatura:', error);
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 404 }
      );
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'ID de assinatura do Stripe não encontrado' },
        { status: 400 }
      );
    }

    // Verifica se a assinatura já está cancelada ou em cancelamento
    if (subscription.status === SubscriptionStatus.CANCELED || 
        subscription.status === SubscriptionStatus.CANCELING) {
      return NextResponse.json(
        { error: 'Assinatura já cancelada ou em processo de cancelamento' },
        { status: 400 }
      );
    }

    // Cancela a assinatura no final do período atual
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Atualiza o status da assinatura no banco de dados
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        cancel_at_period_end: true,
        status: SubscriptionStatus.CANCELING
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar assinatura:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar status da assinatura' },
        { status: 500 }
      );
    }

    console.log(`Assinatura cancelada com sucesso para o usuário ${user.id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Assinatura cancelada com sucesso. Você terá acesso ao plano Premium até o final do período atual.'
    });
  } catch (error: any) {
    console.error('Erro ao cancelar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro ao cancelar assinatura' },
      { status: 500 }
    );
  }
}
