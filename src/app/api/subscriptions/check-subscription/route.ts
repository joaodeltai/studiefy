import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { SubscriptionStatus } from '@/types/subscription';

/**
 * API para verificar o status de uma assinatura no Stripe
 * 
 * Esta API é usada pelo hook useSubscription para verificar se uma assinatura
 * está ativa no Stripe e atualizar os dados no banco de dados se necessário.
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const supabase = await createServerClientWithCookies();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      );
    }
    
    // Obter o ID da assinatura da query string
    const searchParams = request.nextUrl.searchParams;
    const subscriptionId = searchParams.get('subscriptionId');
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'ID da assinatura não fornecido' },
        { status: 400 }
      );
    }
    
    // Verificar se o Stripe foi inicializado
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe nu00e3o foi inicializado. Esta funu00e7u00e3o su00f3 pode ser chamada no servidor.' },
        { status: 500 }
      );
    }
    
    // Buscar a assinatura no Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada no Stripe' },
        { status: 404 }
      );
    }
    
    // Formatar os dados da assinatura para retornar
    const formattedSubscription = {
      id: subscription.id,
      status: subscription.status as SubscriptionStatus,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      customer: subscription.customer,
      items: subscription.items.data.map(item => ({
        id: item.id,
        price: item.price.id,
        product: item.price.product
      }))
    };
    
    // Retornar os dados formatados
    return NextResponse.json({
      success: true,
      subscription: formattedSubscription
    });
    
  } catch (error: any) {
    console.error('Erro ao verificar assinatura no Stripe:', error);
    
    // Retornar erro específico se for um erro do Stripe
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { 
          error: 'Assinatura inválida ou cancelada no Stripe',
          details: error.message 
        },
        { status: 400 }
      );
    }
    
    // Erro genérico para outros casos
    return NextResponse.json(
      { error: 'Erro ao verificar assinatura', details: error.message },
      { status: 500 }
    );
  }
}
