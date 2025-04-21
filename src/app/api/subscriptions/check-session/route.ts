import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID da sessão não fornecido' },
        { status: 400 }
      );
    }

    console.log(`Verificando sessão: ${sessionId}`);

    // Verificar se o Stripe foi inicializado
    if (!stripe) {
      return NextResponse.json(
        { error: 'Cliente Stripe não inicializado' },
        { status: 500 }
      );
    }
    
    // Verifica a sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Se a sessão foi bem-sucedida mas o webhook ainda não processou
    if (session.payment_status === 'paid' && session.status === 'complete') {
      const supabase = await createServerClientWithCookies();
      
      // Verifica se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('Usuário não autenticado ao verificar sessão');
        return NextResponse.json(
          { error: 'Usuário não autenticado' },
          { status: 401 }
        );
      }

      const userId = session.metadata?.userId || user.id;
      
      // Obtém os detalhes da assinatura do Stripe para garantir que temos as informações mais recentes
      let subscription;
      let plan = 'free';
      let priceId;
      
      if (session.subscription) {
        try {
          subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          // Determina o plano com base no ID do preço
          priceId = subscription.items.data[0].price.id;
          plan = priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM 
                  ? 'premium' 
                  : 'free';
                  
          console.log(`Plano determinado a partir da assinatura do Stripe: ${plan}`);
        } catch (error) {
          console.error('Erro ao recuperar assinatura do Stripe:', error);
        }
      }
      
      // Verifica se a assinatura já existe no banco de dados
      const { data: existingSubscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Erro ao verificar assinatura existente:', subscriptionError);
      }

      console.log(`Verificação de assinatura para usuário ${userId}: ${existingSubscription ? 'Encontrada' : 'Não encontrada'}`);
      
      // Se temos os detalhes da assinatura do Stripe
      if (subscription) {
        // Se já existe uma assinatura no banco de dados
        if (existingSubscription) {
          // Verifica se a assinatura precisa ser atualizada (plano diferente ou status diferente)
          if (existingSubscription.plan !== plan || 
              existingSubscription.status !== subscription.status ||
              existingSubscription.stripe_price_id !== priceId) {
              
            console.log(`Atualizando assinatura existente para o plano ${plan}, status atual: ${existingSubscription.plan}`);
            
            // Atualiza a assinatura existente
            const { error: updateError } = await supabase.from('subscriptions').update({
              stripe_price_id: priceId,
              status: subscription.status,
              plan,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            }).eq('user_id', userId);
            
            if (updateError) {
              console.error('Erro ao atualizar assinatura:', updateError);
            } else {
              console.log(`Assinatura atualizada com sucesso para o plano ${plan}`);
            }
            
            // Atualiza o plano de assinatura no perfil do usuário
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ subscription_plan: plan })
              .eq('user_id', userId);
              
            if (profileError) {
              console.error('Erro ao atualizar perfil:', profileError);
            } else {
              console.log(`Perfil atualizado com sucesso para o plano ${plan}`);
            }
          } else {
            console.log(`Assinatura já está atualizada para o plano ${plan}`);
          }
        } else {
          // Se não existe uma assinatura, cria uma nova
          console.log(`Criando nova assinatura para o usuário ${userId} com plano ${plan}`);
          
          const { error: insertError } = await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            status: subscription.status,
            plan,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

          if (insertError) {
            console.error('Erro ao inserir assinatura:', insertError);
          } else {
            console.log(`Assinatura criada com sucesso com plano ${plan}`);
          }

          // Atualiza o plano de assinatura no perfil do usuário
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ subscription_plan: plan })
            .eq('user_id', userId);

          if (profileError) {
            console.error('Erro ao atualizar perfil:', profileError);
          } else {
            console.log(`Perfil atualizado com sucesso para o plano ${plan}`);
          }
        }
      } else {
        console.log(`Não foi possível obter detalhes da assinatura para o ID: ${session.subscription}`);
      }
    } else {
      console.log(`Sessão ${sessionId} ainda não completada ou paga. Status: ${session.status}, Payment Status: ${session.payment_status}`);
    }

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      success: session.payment_status === 'paid' && session.status === 'complete'
    });
  } catch (error: any) {
    console.error('Erro ao verificar sessão:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar sessão de checkout', details: error.message },
      { status: 500 }
    );
  }
}
