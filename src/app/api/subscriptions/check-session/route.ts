import { NextRequest, NextResponse } from 'next/server';
import { createServerClientWithCookies } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    const forceUpdate = url.searchParams.get('force_update') === 'true';

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID da sessão não fornecido' },
        { status: 400 }
      );
    }
    
    console.log(`Verificando sessão: ${sessionId}, force_update: ${forceUpdate}`);

    // Verificar se o Stripe foi inicializado
    if (!stripe) {
      console.error('Cliente Stripe não inicializado');
      return NextResponse.json(
        { error: 'Cliente Stripe não inicializado' },
        { status: 500 }
      );
    }
    
    try {
      // Verifica a sessão no Stripe
      console.log(`Fazendo requisição ao Stripe para verificar a sessão ${sessionId}`);
      
      // Adiciona tratamento de erro mais robusto
      let session;
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['subscription', 'subscription.items.data.price']
        });
      } catch (stripeError: any) {
        console.error('Erro ao recuperar sessão do Stripe:', stripeError);
        return NextResponse.json(
          { error: `Erro ao recuperar sessão: ${stripeError.message}` },
          { status: 400 }
        );
      }
      console.log(`Sessão recuperada com sucesso: status=${session.status}, payment_status=${session.payment_status}`);
      
      // Se a sessão foi bem-sucedida mas o webhook ainda não processou
      // Ou se estamos forçando a atualização, independente do status
      if ((session.payment_status === 'paid' && session.status === 'complete') || forceUpdate) {
        console.log(`Sessão confirmada como paga ou forçando atualização (force_update=${forceUpdate}). Iniciando processamento...`);
        
        // Criar cliente Supabase
        const supabase = await createServerClientWithCookies();
        console.log('Cliente Supabase criado');
        
        // Verifica se o usuário está autenticado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Erro ao obter usuário:', userError);
          return NextResponse.json(
            { error: 'Erro ao verificar autenticação' },
            { status: 500 }
          );
        }
        
        if (!user) {
          console.log('Usuário não autenticado ao verificar sessão');
          return NextResponse.json(
            { error: 'Usuário não autenticado' },
            { status: 401 }
          );
        }
        
        console.log(`Usuário autenticado: ${user.id}`);

      // Usa o userId do metadata da sessão se disponível, caso contrário usa o ID do usuário logado
      const userId = session.metadata?.userId || user.id;
        console.log(`ID do usuário: ${userId}`);
        
        // Mecanismo de recuperação para forçar atualização da assinatura
        if (forceUpdate) {
          try {
            console.log(`Verificando status atual da assinatura para o usuário ${userId}`);
            
            const { data: currentSubscription, error: subscriptionError } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', userId)
              .single();
              
            if (subscriptionError && subscriptionError.code !== 'PGRST116') { // PGRST116 é o código para 'no rows returned'
              console.error('Erro ao buscar assinatura atual:', subscriptionError);
              // Continuamos mesmo com erro, para tentar criar uma nova assinatura
            }
              
            // Se não encontrou assinatura ou o plano não é premium, força a atualização
            if (!currentSubscription || currentSubscription.plan !== 'premium') {
              console.log(`Forçando atualização da assinatura para o usuário ${userId}`);
              
              // Atualiza o perfil do usuário para premium
              try {
                const { error: profileError } = await supabase
                  .from('profiles')
                  .update({ subscription_plan: 'premium' })
                  .eq('user_id', userId);
                  
                if (profileError) {
                  console.error('Erro ao atualizar perfil:', profileError);
                  // Continuamos mesmo com erro para tentar atualizar a assinatura
                } else {
                  console.log(`Perfil atualizado com sucesso para o plano premium`);
                }
              } catch (profileUpdateError) {
                console.error('Exceção ao atualizar perfil:', profileUpdateError);
                // Continuamos mesmo com erro para tentar atualizar a assinatura
              }
              
              // Se não existe uma assinatura, cria uma nova com dados básicos
              if (!currentSubscription) {
                try {
                  console.log('Criando nova assinatura com dados básicos...');
                  const { error: insertError } = await supabase.from('subscriptions').insert({
                    user_id: userId,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    plan: 'premium',
                    status: 'active',
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias
                  });
      
                  if (insertError) {
                    console.error('Erro ao inserir assinatura:', insertError);
                    // Tentamos novamente com upsert em vez de insert
                    console.log('Tentando upsert em vez de insert...');
                    const { error: upsertError } = await supabase.from('subscriptions').upsert({
                      user_id: userId,
                      stripe_customer_id: session.customer as string,
                      stripe_subscription_id: session.subscription as string,
                      plan: 'premium',
                      status: 'active',
                      current_period_start: new Date().toISOString(),
                      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias
                    });
                    
                    if (upsertError) {
                      console.error('Erro ao fazer upsert da assinatura:', upsertError);
                    } else {
                      console.log(`Assinatura criada com sucesso via upsert com plano premium`);
                    }
                  } else {
                    console.log(`Assinatura criada com sucesso com plano premium`);
                  }
                } catch (subscriptionCreateError) {
                  console.error('Exceção ao criar assinatura:', subscriptionCreateError);
                }
              } else {
                // Atualiza a assinatura existente
                try {
                  console.log('Atualizando assinatura existente...');
                  const { error: updateError } = await supabase.from('subscriptions').update({
                    plan: 'premium',
                    status: 'active',
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias
                  }).eq('user_id', userId);
                  
                  if (updateError) {
                    console.error('Erro ao atualizar assinatura:', updateError);
                    // Tentamos novamente com upsert em vez de update
                    console.log('Tentando upsert em vez de update...');
                    const { error: upsertError } = await supabase.from('subscriptions').upsert({
                      user_id: userId,
                      plan: 'premium',
                      status: 'active',
                      stripe_customer_id: session.customer as string,
                      stripe_subscription_id: session.subscription as string,
                      current_period_start: new Date().toISOString(),
                      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias
                    });
                    
                    if (upsertError) {
                      console.error('Erro ao fazer upsert da assinatura:', upsertError);
                    } else {
                      console.log(`Assinatura atualizada com sucesso via upsert para o plano premium`);
                    }
                  } else {
                    console.log(`Assinatura atualizada com sucesso para o plano premium`);
                  }
                } catch (subscriptionUpdateError) {
                  console.error('Exceção ao atualizar assinatura:', subscriptionUpdateError);
                }
              }
            } else {
              console.log(`Assinatura já está atualizada para o plano premium`);
            }
          } catch (recoveryError) {
            console.error('Erro na recuperação de assinatura:', recoveryError);
          }
        }
      
      // Obtém os detalhes da assinatura do Stripe para garantir que temos as informações mais recentes
      let subscription;
      let plan = 'free';
      let priceId;
      
      if (session.subscription) {
        try {
          console.log(`Processando detalhes da assinatura`);
          
          // Verifica se a assinatura já foi expandida na resposta
          if (typeof session.subscription === 'object' && session.subscription !== null) {
            console.log('Usando objeto de assinatura expandido');
            subscription = session.subscription;
          } else {
            // Caso contrário, busca a assinatura pelo ID
            try {
              console.log(`Recuperando detalhes da assinatura: ${session.subscription}`);
              subscription = await stripe.subscriptions.retrieve(
                session.subscription as string,
                { expand: ['items.data.price'] }
              );
            } catch (stripeSubscriptionError: any) {
              console.error('Erro ao recuperar detalhes da assinatura do Stripe:', stripeSubscriptionError);
              
              // Mesmo com erro, continuamos o processamento com dados básicos
              console.log('Continuando com dados básicos da assinatura...');
              subscription = {
                id: session.subscription as string,
                status: 'active',
                current_period_start: Math.floor(Date.now() / 1000),
                current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
                cancel_at_period_end: false,
                items: { data: [{ price: { id: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM } }] }
              };
            }
          }
          
          // Verifica se a assinatura tem itens
          try {
            if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
              try {
                // Verifica se o objeto price está disponível
                if (subscription.items.data[0].price && subscription.items.data[0].price.id) {
                  priceId = subscription.items.data[0].price.id;
                  plan = 'premium'; // Sempre definimos como premium para garantir o acesso
                  console.log(`Plano definido como premium, baseado no preço: ${priceId}`);
                } else {
                  console.warn('Objeto price não encontrado na resposta do Stripe, usando plano padrão');
                  plan = 'premium';
                  priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || '';
                }
              } catch (priceError) {
                console.error('Erro ao determinar plano:', priceError);
                // Assume plano premium em caso de erro
                plan = 'premium';
                priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || '';
              }
            } else {
              console.warn('Assinatura não tem itens ou dados de preço, usando plano padrão');
              plan = 'premium';
              priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || '';
            }
          } catch (itemsError) {
            console.error('Erro ao acessar itens da assinatura:', itemsError);
            // Assume plano premium em caso de erro
            plan = 'premium';
            priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || '';
          }
        } catch (error) {
          console.error('Erro ao processar assinatura do Stripe:', error);
          // Mesmo com erro, definimos como premium para garantir acesso ao usuário
          plan = 'premium';
        }
      } else {
        console.log('Sessão não possui ID de assinatura');
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

    // Verificar se a assinatura foi atualizada no banco de dados - isso será feito dentro do bloco onde temos acesso ao supabase e usuário
    
    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      success: session.payment_status === 'paid' && session.status === 'complete'
    });
    
    } catch (stripeError: any) {
      console.error('Erro ao processar dados do Stripe:', stripeError);
      console.error('Detalhes do erro:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code,
        stack: stripeError.stack
      });
      
      // Se o erro for relacionado a uma sessão expirada ou inválida
      if (stripeError.code === 'resource_missing' || stripeError.message.includes('No such checkout.session')) {
        return NextResponse.json(
          { error: 'Sessão de checkout não encontrada ou expirada', details: stripeError.message },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erro ao processar dados do Stripe', details: stripeError.message, code: stripeError.code },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Erro ao verificar sessão:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar sessão de checkout', details: error.message },
      { status: 500 }
    );
  }
}
