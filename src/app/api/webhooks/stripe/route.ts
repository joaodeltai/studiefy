import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { stripe, determinePlan, determinePeriod } from '../../../../lib/stripe';
import Stripe from 'stripe';
import { SubscriptionPlan, SubscriptionStatus } from '../../../../types/subscription';
import { stripeWebhookLogger as logger } from '../../../../lib/logger';

// Esta função é responsável por processar os webhooks do Stripe
export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;
  
  logger.info('Webhook recebido do Stripe');
  
  if (!signature) {
    logger.error('Assinatura do webhook não encontrada');
    return NextResponse.json(
      { error: 'Assinatura do webhook não encontrada' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verifica se o stripe está inicializado
    if (!stripe) {
      throw new Error('Cliente Stripe não inicializado');
    }
    
    // Verifica a assinatura do webhook para garantir que veio do Stripe
    // Primeiro tenta usar STRIPE_WEBHOOK_ENDPOINT_SECRET, depois STRIPE_WEBHOOK_SECRET como fallback
    const webhookSecret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('Segredo do webhook do Stripe não configurado');
    }
    
    logger.info(`Validando assinatura do webhook com a chave secreta`);
    
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
    logger.info(`Evento do Stripe processado com sucesso: ${event.type}`, { eventType: event.type });
  } catch (error: any) {
    logger.error(`Erro na assinatura do webhook: ${error.message}`, { error: error.message });
    return NextResponse.json(
      { error: `Erro na assinatura do webhook: ${error.message}` },
      { status: 400 }
    );
  }

  // Cria um cliente Supabase administrativo para acessar o banco de dados
  // Este cliente não depende de cookies e usa a chave de serviço
  // Cria um cliente Supabase administrativo para acessar o banco de dados
  // Este cliente não depende de cookies e usa a chave de serviço
  const supabase = createAdminClient();
  
  // Log para verificar se o cliente admin foi criado corretamente
  logger.info('Cliente admin do Supabase criado com sucesso');

  // Processa diferentes tipos de eventos
  try {
    // Log detalhado do evento recebido para depuração
    logger.info(`Processando evento do Stripe: ${event.type}`, {
      eventId: event.id,
      eventType: event.type,
      apiVersion: event.api_version,
      created: new Date(event.created * 1000).toISOString()
    });
    
    // Verificar se o evento já foi processado anteriormente (evitar duplicação)
    // Isso é importante porque o Stripe pode enviar o mesmo evento várias vezes
    try {
      const { data: existingEvent } = await supabase
        .from('stripe_events')
        .select('id')
        .eq('event_id', event.id)
        .maybeSingle();
        
      if (existingEvent) {
        logger.info(`Evento ${event.id} já foi processado anteriormente, ignorando`, {
          eventId: event.id,
          eventType: event.type
        });
        return NextResponse.json({ received: true, status: 'already_processed' });
      }
      
      // Registrar o evento para evitar processamento duplicado
      await supabase
        .from('stripe_events')
        .insert({
          event_id: event.id,
          event_type: event.type,
          processed_at: new Date().toISOString()
        });
    } catch (dbError: any) {
      // Se houver erro ao verificar/registrar o evento, continuamos com o processamento
      // mas registramos o erro para depuração
      logger.warn(`Erro ao verificar/registrar evento no banco: ${dbError.message}`, {
        eventId: event.id,
        error: dbError.message
      });
      // Não interrompemos o fluxo aqui, apenas logamos o erro
    }
    
    switch (event.type) {
      // Quando uma assinatura é criada
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        logger.info(`Processando checkout.session.completed para sessão ${session.id}`, {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
          userId,
          sessionObject: JSON.stringify(session)
        });
        
        // Log adicional para depuração
        console.log('Dados completos da sessão:', JSON.stringify(session, null, 2));
        
        if (!userId) {
          throw new Error('ID do usuário não encontrado nos metadados da sessão');
        }

        // Verifica se o stripe está inicializado
        if (!stripe) {
          throw new Error('Cliente Stripe não inicializado');
        }
        
        // Declara a variável subscription fora do escopo condicional
        let subscription;
        
        // Verifica se o ID da assinatura está presente na sessão
        if (!session.subscription) {
          logger.warn(`Sessão de checkout sem ID de assinatura: ${session.id}`, {
            sessionId: session.id,
            customerId: session.customer,
            userId
          });
          
          // Tenta buscar a assinatura pelo cliente
          const subscriptions = await stripe.subscriptions.list({
            customer: session.customer as string,
            limit: 1
          });
          
          if (subscriptions.data.length === 0) {
            logger.error(`Nenhuma assinatura encontrada para o cliente ${session.customer}`);
            throw new Error(`Nenhuma assinatura encontrada para o cliente ${session.customer}`);
          }
          
          // Usa a assinatura mais recente
          subscription = subscriptions.data[0];
          logger.info(`Assinatura encontrada pelo cliente: ${subscription.id}`);
        } else {
          // Obtém os detalhes da assinatura do Stripe usando o ID da sessão
          logger.info(`Buscando assinatura com ID: ${session.subscription}`);
          subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        }

        // Determina o plano com base no ID do preço
        const priceId = subscription.items.data[0].price.id;
        const plan = determinePlan(priceId);
        const period = determinePeriod(priceId);

        // Buscar o profile_id do usuário
        logger.info(`Buscando perfil para o usuário ${userId}`);
        
        // Primeiro, tentamos buscar o perfil sem usar .single() para evitar erros
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('user_id', userId);

        if (profilesError) {
          logger.error(`Erro ao buscar perfil: ${profilesError.message}`, {
            userId,
            error: profilesError
          });
          throw new Error(`Erro ao buscar perfil: ${profilesError.message}`);
        }

        // Verificamos se encontramos algum perfil
        let profileData;
        if (profilesData && profilesData.length > 0) {
          // Se encontrarmos múltiplos perfis, usamos o primeiro
          profileData = profilesData[0];
          logger.info(`Encontrados ${profilesData.length} perfis para o usuário ${userId}, usando o primeiro`);
        } else {
          // Se não encontrarmos nenhum perfil, criamos um novo
          logger.info(`Perfil não encontrado para o usuário ${userId}, criando um novo`);
          
          // Buscar informações do usuário para criar o perfil
          const { data: userData, error: userError } = await supabase.auth
            .admin
            .getUserById(userId);
            
          if (userError) {
            // Se não conseguirmos obter informações do usuário, criamos um perfil básico
            logger.warn(`Não foi possível obter informações do usuário: ${userError.message}`, {
              userId,
              error: userError
            });
          }
          
          const email = userData?.user?.email || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'usuario@exemplo.com';
          const name = email.split('@')[0];
          
          // Criar um novo perfil com o cliente admin
          // Garantir que estamos ignorando as políticas RLS
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              name: name,
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              subscription_plan: 'premium' // Novos usuários começam com trial premium
            })
            .select('id, name, email')
            .single();
            
          if (createError) {
            logger.error(`Erro ao criar perfil: ${createError.message}`, {
              userId,
              error: createError
            });
            throw new Error(`Erro ao criar perfil: ${createError.message}`);
          }
          
          profileData = newProfile;
        }
        
        logger.info(`Perfil encontrado para o usuário ${userId}`, {
          profileId: profileData.id,
          name: profileData.name,
          email: profileData.email
        });

        // Insere ou atualiza os dados da assinatura no banco de dados
        logger.info(`Atualizando assinatura para o usuário ${userId}`, {
          customerId: session.customer,
          subscriptionId: subscription.id,
          priceId,
          plan,
          period
        });
        
        // Primeiro verificamos se já existe uma assinatura para este usuário
        // Adicionamos log detalhado para depuração
        logger.info(`Verificando assinatura existente para usuário ${userId}`);
        
        const { data: existingSubscription, error: findError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        // Log detalhado do resultado da consulta
        logger.info(`Resultado da consulta de assinatura existente:`, {
          found: !!existingSubscription,
          subscriptionId: existingSubscription?.id,
          hasError: !!findError,
          errorMessage: findError?.message
        });
          
        if (findError) {
          logger.warn(`Erro ao verificar assinatura existente: ${findError.message}`, {
            userId,
            error: findError
          });
          // Continuamos mesmo com erro, tentando criar uma nova assinatura
        }
        
        const subscriptionData = {
          user_id: userId,
          profile_id: profileData.id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          // Garantir que o status nunca seja nulo
          status: (subscription.status as SubscriptionStatus) || SubscriptionStatus.ACTIVE,
          plan,
          period,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        let subscriptionError;
        
        if (existingSubscription) {
          // Se a assinatura existe, atualizamos
          logger.info(`Atualizando assinatura existente para o usuário ${userId}`, {
            existingSubscriptionId: existingSubscription.id,
            newStripeSubscriptionId: subscription.id,
            newStripeCustomerId: session.customer
          });
          
          // Garantir que os IDs do Stripe sejam atualizados
          logger.info(`Atualizando assinatura existente com stripe_subscription_id: ${subscription.id}`);
          
          // Criar um objeto de atualização com ênfase nos campos do Stripe
          const updateData = {
            ...subscriptionData,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString()
          };
          
          // Log detalhado dos dados que serão atualizados
          logger.info(`Dados para atualização da assinatura:`, {
            subscriptionId: existingSubscription.id,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: session.customer,
            oldStripeSubscriptionId: existingSubscription.stripe_subscription_id
          });
          
          const { error, data: updatedData } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('id', existingSubscription.id)
            .select();
            
          // Log detalhado do resultado da atualização
          if (updatedData && updatedData.length > 0) {
            logger.info(`Assinatura atualizada com sucesso:`, {
              updatedId: updatedData[0]?.id,
              updatedSubscriptionId: updatedData[0]?.stripe_subscription_id,
              allData: JSON.stringify(updatedData[0])
            });
            
            // Verificação adicional para garantir que o stripe_subscription_id foi atualizado
            if (!updatedData[0]?.stripe_subscription_id || updatedData[0]?.stripe_subscription_id === '') {
              logger.warn(`O campo stripe_subscription_id não foi atualizado corretamente. Tentando atualizar explicitamente.`);
              
              // Tentativa de atualização explícita do campo stripe_subscription_id
              const { error: updateError } = await supabase
                .from('subscriptions')
                .update({ 
                  stripe_subscription_id: subscription.id,
                  updated_at: new Date().toISOString()
                })
                .eq('id', updatedData[0].id);
                
              if (updateError) {
                logger.error(`Erro na atualização explícita do stripe_subscription_id: ${updateError.message}`, {
                  subscriptionId: updatedData[0].id,
                  stripeSubscriptionId: subscription.id,
                  error: updateError.message
                });
              } else {
                logger.info(`Campo stripe_subscription_id atualizado explicitamente com sucesso para: ${subscription.id}`);
              }
            }
          } else {
            logger.error(`Falha ao atualizar assinatura: dados de retorno vazios ou nulos`);
          }
            
          subscriptionError = error;
        } else {
          // Se não existe, criamos uma nova
          logger.info(`Criando nova assinatura para o usuário ${userId}`);
          
          // Garantir que o stripe_subscription_id seja definido corretamente
          logger.info(`Criando nova assinatura com stripe_subscription_id: ${subscription.id}`);
          
          // Garantir que o objeto subscriptionData tenha o stripe_subscription_id definido
          if (!subscriptionData.stripe_subscription_id) {
            subscriptionData.stripe_subscription_id = subscription.id;
            logger.warn(`stripe_subscription_id estava indefinido, definindo para: ${subscription.id}`);
          }
          
          // Forçar o campo stripe_subscription_id a ser definido explicitamente
          const subscriptionToInsert = {
            ...subscriptionData,
            stripe_subscription_id: subscription.id // Garantir que este campo seja definido
          };
          
          // Log detalhado dos dados que serão inseridos
          logger.info(`Dados para inserção da assinatura:`, {
            userId,
            stripeSubscriptionId: subscriptionToInsert.stripe_subscription_id,
            stripeCustomerId: subscriptionToInsert.stripe_customer_id
          });
          
          // Inserir com força bruta, garantindo que o campo stripe_subscription_id seja definido
          const { error, data: insertedData } = await supabase
            .from('subscriptions')
            .insert(subscriptionToInsert)
            .select();
            
          // Log detalhado do resultado da inserção
          if (insertedData && insertedData.length > 0) {
            logger.info(`Assinatura inserida com sucesso:`, {
              insertedId: insertedData[0]?.id,
              insertedSubscriptionId: insertedData[0]?.stripe_subscription_id,
              allData: JSON.stringify(insertedData[0])
            });
            
            // Verificação adicional para garantir que o stripe_subscription_id foi salvo
            if (!insertedData[0]?.stripe_subscription_id) {
              logger.warn(`O campo stripe_subscription_id não foi salvo corretamente. Tentando atualizar explicitamente.`);
              
              // Tentativa de atualização explícita do campo stripe_subscription_id
              const { error: updateError } = await supabase
                .from('subscriptions')
                .update({ stripe_subscription_id: subscription.id })
                .eq('id', insertedData[0].id);
                
              if (updateError) {
                logger.error(`Erro na atualização explícita do stripe_subscription_id: ${updateError.message}`, {
                  subscriptionId: insertedData[0].id,
                  stripeSubscriptionId: subscription.id,
                  error: updateError.message
                });
              } else {
                logger.info(`Campo stripe_subscription_id atualizado explicitamente com sucesso para: ${subscription.id}`);
              }
            }
          } else {
            logger.error(`Falha ao inserir assinatura: dados de retorno vazios ou nulos`);
          }
            
          subscriptionError = error;
        }

        if (subscriptionError) {
          logger.error(`Erro ao ${existingSubscription ? 'atualizar' : 'criar'} assinatura: ${subscriptionError.message}`, {
            userId,
            error: subscriptionError
          });
          throw new Error(`Erro ao ${existingSubscription ? 'atualizar' : 'criar'} assinatura: ${subscriptionError.message}`);
        }
        
        logger.info(`Assinatura atualizada com sucesso para o usuário ${userId}`, {
          subscriptionId: subscription.id,
          plan,
          status: subscription.status
        });

        // Atualiza o plano de assinatura no perfil do usuário
        logger.info(`Atualizando plano de assinatura no perfil do usuário ${userId}`, {
          userId,
          plan
        });
        
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ subscription_plan: plan })
          .eq('user_id', userId);

        if (profileUpdateError) {
          logger.error(`Erro ao atualizar perfil: ${profileUpdateError.message}`, {
            userId,
            error: profileUpdateError
          });
          throw new Error(`Erro ao atualizar perfil: ${profileUpdateError.message}`);
        }
        
        logger.info(`Perfil atualizado com sucesso para o usuário ${userId}`, {
          userId,
          plan
        });

        logger.info(`Assinatura criada com sucesso para o usuário ${userId}`, { 
          userId, 
          subscriptionId: subscription.id,
          plan 
        });
        
        break;
      }
      
      // Quando uma assinatura é atualizada
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const customerId = subscription.customer as string;
        
        logger.info(`Processando customer.subscription.updated para assinatura ${subscriptionId}`, {
          subscriptionId,
          customerId,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        });
        
        // Busca a assinatura no banco de dados
        let { data: subscriptionData, error: findError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle();
          
        if (findError) {
          logger.error(`Erro ao buscar assinatura: ${findError.message}`, {
            subscriptionId,
            error: findError
          });
        }
        
        if (!subscriptionData) {
          // Se a assinatura não for encontrada, tentamos buscar pelo customer_id
          logger.info(`Assinatura não encontrada pelo ID ${subscriptionId}, tentando buscar pelo customer_id ${customerId}`);
          
          const { data: customerSubscriptionData, error: customerFindError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
            
          if (customerFindError) {
            logger.error(`Erro ao buscar assinatura pelo customer_id: ${customerFindError.message}`, {
              customerId,
              error: customerFindError
            });
          }
          
          if (customerSubscriptionData) {
            // Se encontrarmos pelo customer_id, atualizamos o subscription_id
            logger.info(`Assinatura encontrada pelo customer_id ${customerId}, atualizando subscription_id para ${subscriptionId}`);
            
            const { error: updateError } = await supabase
              .from('subscriptions')
              .update({ stripe_subscription_id: subscriptionId })
              .eq('id', customerSubscriptionData.id);
              
            if (updateError) {
              logger.error(`Erro ao atualizar subscription_id: ${updateError.message}`, {
                subscriptionId,
                customerId,
                error: updateError
              });
              throw new Error(`Erro ao atualizar subscription_id: ${updateError.message}`);
            }
            
            // Usar os dados atualizados
            subscriptionData = customerSubscriptionData;
            subscriptionData.stripe_subscription_id = subscriptionId;
          } else {
            // Se não encontrarmos nem pelo subscription_id nem pelo customer_id,
            // vamos tentar obter o usuário associado ao customer_id no Stripe
            logger.info(`Tentando obter informações do cliente ${customerId} no Stripe`);
            
            try {
              if (!stripe) {
                throw new Error('Cliente Stripe não inicializado');
              }
              
              const customer = await stripe.customers.retrieve(customerId);
              
              if (customer.deleted) {
                throw new Error(`Cliente ${customerId} foi excluído`);
              }
              
              // Extrair o metadata.userId se existir
              const userId = customer.metadata?.userId;
              
              if (!userId) {
                logger.error(`Não foi possível encontrar o userId no metadata do cliente ${customerId}`);
                throw new Error(`Não foi possível encontrar o userId no metadata do cliente ${customerId}`);
              }
              
              logger.info(`Encontrado userId ${userId} para o cliente ${customerId}`);
              
              // Buscar o perfil do usuário
              const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', userId);
                
              if (profilesError) {
                logger.error(`Erro ao buscar perfil: ${profilesError.message}`, {
                  userId,
                  error: profilesError
                });
                throw new Error(`Erro ao buscar perfil: ${profilesError.message}`);
              }
              
              if (!profilesData || profilesData.length === 0) {
                logger.error(`Perfil não encontrado para o usuário ${userId}`);
                throw new Error(`Perfil não encontrado para o usuário ${userId}`);
              }
              
              const profileId = profilesData[0].id;
              
              // Determinar o plano com base no ID do preço
              const priceId = subscription.items.data[0].price.id;
              const plan = determinePlan(priceId);
              const period = determinePeriod(priceId);
              
              // Criar uma nova assinatura
              const newSubscription = {
                user_id: userId,
                profile_id: profileId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                stripe_price_id: priceId,
                status: subscription.status as SubscriptionStatus,
                plan,
                period,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              logger.info(`Criando nova assinatura para o usuário ${userId}`);
              
              const { data: newSubscriptionData, error: createError } = await supabase
                .from('subscriptions')
                .insert(newSubscription)
                .select()
                .single();
                
              if (createError) {
                logger.error(`Erro ao criar assinatura: ${createError.message}`, {
                  userId,
                  subscriptionId,
                  error: createError
                });
                throw new Error(`Erro ao criar assinatura: ${createError.message}`);
              }
              
              subscriptionData = newSubscriptionData;
            } catch (error: any) {
              logger.error(`Erro ao processar cliente Stripe: ${error.message}`, {
                customerId,
                subscriptionId,
                error: error.message,
                stack: error.stack
              });
              throw new Error(`Erro ao processar cliente Stripe: ${error.message}`);
            }
          }
        }
        
        // Atualiza o status da assinatura
        logger.info(`Atualizando assinatura ${subscriptionData.id} com subscription_id ${subscriptionId}`);
        
        try {
          const updateData = {
            status: subscription.status as SubscriptionStatus,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId
          };
          
          // Log dos dados que serão atualizados
          logger.info(`Dados para atualização da assinatura:`, {
            subscriptionId: subscriptionData.id,
            stripeSubscriptionId: subscriptionId,
            updateData
          });
          
          const { error, data: updatedData } = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('id', subscriptionData.id)
            .select();
          
          if (error) {
            logger.error(`Erro ao atualizar assinatura: ${error.message}`, {
              subscriptionId: subscriptionData.id,
              stripeSubscriptionId: subscriptionId,
              error: error.message,
              details: error.details,
              hint: error.hint
            });
            throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
          }
          
          logger.info(`Assinatura atualizada com sucesso:`, {
            id: subscriptionData.id,
            updatedData
          });
        } catch (error: any) {
          logger.error(`Exceção ao atualizar assinatura: ${error.message}`, {
            subscriptionId: subscriptionData.id,
            stripeSubscriptionId: subscriptionId,
            error: error.message,
            stack: error.stack
          });
          throw error;
        }
        
        // Se a assinatura foi cancelada, atualiza o plano do usuário para FREE
        if (subscription.status === 'canceled') {
          // Atualiza o plano de assinatura no perfil do usuário para free
          const { error: profileError3 } = await supabase
            .from('profiles')
            .update({ subscription_plan: SubscriptionPlan.FREE })
            .eq('user_id', subscriptionData.user_id);

          if (profileError3) {
            logger.error(`Erro ao atualizar perfil: ${profileError3.message}`, {
              userId: subscriptionData.user_id,
              error: profileError3
            });
            throw new Error(`Erro ao atualizar perfil: ${profileError3.message}`);
          }
          
          logger.info(`Assinatura cancelada com sucesso para o usuário ${subscriptionData.user_id}`, { 
            userId: subscriptionData.user_id, 
            subscriptionId 
          });
        }
        
        break;
      }
      
      // Quando um pagamento falha
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        logger.warn(`Falha no pagamento da fatura ${invoice.id} para assinatura ${subscriptionId}`, {
          invoiceId: invoice.id,
          subscriptionId
        });
        
        // Busca a assinatura no banco de dados
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscriptionId)
          .single();
          
        if (!subscriptionData) {
          throw new Error(`Assinatura não encontrada: ${subscriptionId}`);
        }
        
        // Atualiza o status da assinatura para past_due
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due' as SubscriptionStatus,
            updated_at: new Date().toISOString(),
            stripe_subscription_id: subscriptionId
          })
          .eq('id', subscriptionData.id);
          
        if (error) {
          throw new Error(`Erro ao atualizar status da assinatura: ${error.message}`);
        }
        
        logger.warn(`Falha no pagamento da assinatura ${subscriptionId} para o usuário ${subscriptionData.user_id}`, {
          userId: subscriptionData.user_id,
          subscriptionId,
          invoiceId: invoice.id,
          amountDue: invoice.amount_due / 100
        });
        
        // Aqui poderia ser implementado um sistema de notificação ao usuário
        // TODO: Enviar email informando sobre a falha no pagamento
        
        break;
      }
      
      // Quando um pagamento é bem-sucedido
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        const customerId = invoice.customer as string;
        
        if (!subscriptionId) {
          logger.warn('Pagamento não associado a uma assinatura', { invoiceId: invoice.id });
          break;
        }
        
        // Busca a assinatura no banco de dados
        let { data: subscriptionData, error: findError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle();
          
        logger.info(`Verificando assinatura para pagamento: ${subscriptionId}`, {
          subscriptionId,
          customerId,
          invoiceId: invoice.id,
          subscriptionFound: !!subscriptionData
        });
        
        if (findError) {
          logger.error(`Erro ao buscar assinatura: ${findError.message}`, {
            subscriptionId,
            error: findError
          });
        }
        
        if (!subscriptionData) {
          // Se a assinatura não for encontrada, tentamos buscar pelo customer_id
          logger.info(`Assinatura não encontrada pelo ID ${subscriptionId}, tentando buscar pelo customer_id ${customerId}`);
          
          const { data: customerSubscriptionData, error: customerFindError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
            
          if (customerFindError) {
            logger.error(`Erro ao buscar assinatura pelo customer_id: ${customerFindError.message}`, {
              customerId,
              error: customerFindError
            });
          }
          
          if (customerSubscriptionData) {
            // Se encontrarmos pelo customer_id, atualizamos o subscription_id
            logger.info(`Assinatura encontrada pelo customer_id ${customerId}, atualizando subscription_id para ${subscriptionId}`);
            
            const { error: updateError } = await supabase
              .from('subscriptions')
              .update({ stripe_subscription_id: subscriptionId })
              .eq('id', customerSubscriptionData.id);
              
            if (updateError) {
              logger.error(`Erro ao atualizar subscription_id: ${updateError.message}`, {
                subscriptionId,
                customerId,
                error: updateError
              });
              throw new Error(`Erro ao atualizar subscription_id: ${updateError.message}`);
            }
            
            subscriptionData = customerSubscriptionData;
            subscriptionData.stripe_subscription_id = subscriptionId;
          } else {
            // Se não encontrarmos a assinatura, vamos tentar criar uma nova
            logger.info(`Tentando obter detalhes da assinatura ${subscriptionId} no Stripe`);
            
            try {
              if (!stripe) {
                throw new Error('Cliente Stripe não inicializado');
              }
              
              // Obter detalhes da assinatura no Stripe
              const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
              const customer = await stripe.customers.retrieve(customerId);
              
              if (customer.deleted) {
                throw new Error(`Cliente ${customerId} foi excluído`);
              }
              
              // Extrair o metadata.userId se existir
              const userId = customer.metadata?.userId;
              
              if (!userId) {
                logger.error(`Não foi possível encontrar o userId no metadata do cliente ${customerId}`);
                throw new Error(`Não foi possível encontrar o userId no metadata do cliente ${customerId}`);
              }
              
              logger.info(`Encontrado userId ${userId} para o cliente ${customerId}`);
              
              // Buscar ou criar o perfil do usuário
              const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', userId);
                
              if (profilesError) {
                logger.error(`Erro ao buscar perfil: ${profilesError.message}`, {
                  userId,
                  error: profilesError
                });
                throw new Error(`Erro ao buscar perfil: ${profilesError.message}`);
              }
              
              let profileId;
              
              if (!profilesData || profilesData.length === 0) {
                // Criar um novo perfil com o cliente admin
                logger.info(`Perfil não encontrado para o usuário ${userId}, criando um novo`);
                
                // Buscar informações do usuário
                const { data: userData, error: userError } = await supabase.auth
                  .admin
                  .getUserById(userId);
                  
                let email = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'usuario@exemplo.com';
                if (userData?.user?.email) {
                  email = userData.user.email;
                } else if (userError) {
                  logger.warn(`Não foi possível obter informações do usuário: ${userError.message}`, {
                    userId,
                    error: userError
                  });
                }
                
                const name = email.split('@')[0];
                
                const { data: newProfile, error: createProfileError } = await supabase
                  .from('profiles')
                  .insert({
                    user_id: userId,
                    name: name,
                    email: email,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    subscription_plan: 'premium' // Novos usuários começam com trial premium
                  })
                  .select('id')
                  .single();
                  
                if (createProfileError) {
                  logger.error(`Erro ao criar perfil: ${createProfileError.message}`, {
                    userId,
                    error: createProfileError
                  });
                  throw new Error(`Erro ao criar perfil: ${createProfileError.message}`);
                }
                
                profileId = newProfile.id;
              } else {
                profileId = profilesData[0].id;
              }
              
              // Determinar o plano com base no ID do preço
              const priceId = stripeSubscription.items.data[0].price.id;
              const plan = determinePlan(priceId);
              const period = determinePeriod(priceId);
              
              // Criar uma nova assinatura
              const newSubscription = {
                user_id: userId,
                profile_id: profileId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                stripe_price_id: priceId,
                status: stripeSubscription.status as SubscriptionStatus,
                plan,
                period,
                current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: stripeSubscription.cancel_at_period_end,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              logger.info(`Criando nova assinatura para o usuário ${userId}`, {
                userId,
                subscriptionId,
                plan
              });
              
              const { data: newSubscriptionData, error: createError } = await supabase
                .from('subscriptions')
                .insert(newSubscription)
                .select()
                .single();
                
              if (createError) {
                logger.error(`Erro ao criar assinatura: ${createError.message}`, {
                  userId,
                  subscriptionId,
                  error: createError
                });
                throw new Error(`Erro ao criar assinatura: ${createError.message}`);
              }
              
              // Atualizar o plano no perfil do usuário
              const { error: profileUpdateError } = await supabase
                .from('profiles')
                .update({ subscription_plan: plan })
                .eq('id', profileId);
                
              if (profileUpdateError) {
                logger.warn(`Erro ao atualizar plano no perfil: ${profileUpdateError.message}`, {
                  userId,
                  profileId,
                  error: profileUpdateError
                });
                // Não lançamos erro aqui, apenas logamos o aviso
              }
              
              subscriptionData = newSubscriptionData;
            } catch (error: any) {
              logger.error(`Erro ao processar assinatura Stripe: ${error.message}`, {
                customerId,
                subscriptionId,
                error: error.message,
                stack: error.stack
              });
              throw new Error(`Erro ao processar assinatura Stripe: ${error.message}`);
            }
          }
        }
        
        // Verifica se o stripe está inicializado
        if (!stripe) {
          throw new Error('Cliente Stripe não inicializado');
        }
        
        // Obtém os detalhes atualizados da assinatura
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Se a assinatura estava em past_due ou já está ativa, atualizamos o status
        // Isso garante que assinaturas que falharam em pagamentos anteriores sejam reativadas
        if (subscriptionData && (subscriptionData.status === 'past_due' || subscriptionData.status === 'active')) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'active' as SubscriptionStatus,
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId
            })
            .eq('id', subscriptionData.id);
            
          if (error) {
            throw new Error(`Erro ao atualizar status da assinatura: ${error.message}`);
          }
          
          logger.info(`Pagamento realizado com sucesso, assinatura ${subscriptionId} atualizada para o usuário ${subscriptionData.user_id}`, {
            userId: subscriptionData.user_id,
            subscriptionId,
            invoiceId: invoice.id,
            amountPaid: invoice.amount_paid / 100,
            oldStatus: subscriptionData.status,
            newStatus: 'active',
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString()
          });
          
          // Aqui poderia ser implementado um sistema de notificação ao usuário
          // TODO: Enviar email confirmando o pagamento e a reativação da assinatura
        } else {
          // Mesmo que a assinatura já esteja ativa, vamos atualizar os períodos e outros campos
          // para garantir que tudo esteja sincronizado com o Stripe
          logger.info(`Atualizando períodos da assinatura ${subscriptionData.id} com subscription_id ${subscriptionId}`);
          
          try {
            const updateData = {
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId
            };
            
            // Log dos dados que serão atualizados
            logger.info(`Dados para atualização dos períodos:`, {
              subscriptionId: subscriptionData.id,
              stripeSubscriptionId: subscriptionId,
              updateData
            });
            
            const { error, data: updatedData } = await supabase
              .from('subscriptions')
              .update(updateData)
              .eq('id', subscriptionData.id)
              .select();
              
            if (error) {
              logger.error(`Erro ao atualizar períodos da assinatura: ${error.message}`, {
                subscriptionId: subscriptionData.id,
                stripeSubscriptionId: subscriptionId,
                error: error.message,
                details: error.details,
                hint: error.hint
              });
            } else {
              logger.info(`Períodos atualizados com sucesso:`, {
                id: subscriptionData.id,
                updatedData,
                userId: subscriptionData.user_id,
                subscriptionId,
                invoiceId: invoice.id,
                amountPaid: invoice.amount_paid / 100,
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString()
              });
            }
          } catch (error: any) {
            logger.error(`Exceção ao atualizar períodos da assinatura: ${error.message}`, {
              subscriptionId: subscriptionData.id,
              stripeSubscriptionId: subscriptionId,
              error: error.message,
              stack: error.stack
            });
            // Não lançamos o erro aqui para não interromper o fluxo
          }
        }
        
        // Registrar o pagamento no histórico
        const { error: paymentHistoryError } = await supabase
          .from('payment_history')
          .insert({
            user_id: subscriptionData.user_id,
            stripe_invoice_id: invoice.id,
            stripe_subscription_id: subscriptionId,
            amount_paid: invoice.amount_paid / 100, // Convertendo de centavos para a moeda
            invoice_pdf: invoice.invoice_pdf,
            payment_date: new Date().toISOString(),
          });
          
        if (paymentHistoryError) {
          logger.error(`Erro ao registrar histórico de pagamento: ${paymentHistoryError.message}`, {
            userId: subscriptionData.user_id,
            invoiceId: invoice.id,
            error: paymentHistoryError
          });
        }
        
        break;
      }

      default:
        logger.debug(`Evento não processado: ${event.type}`, { eventType: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    // Log detalhado do erro para facilitar a depuração
    logger.error(`Erro ao processar webhook: ${error.message}`, { 
      eventId: event?.id,
      eventType: event?.type,
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      details: JSON.stringify(error)
    });
    
    // Verificar se é um erro de validação do Supabase
    if (error.message.includes('violates foreign key constraint') || 
        error.message.includes('violates not-null constraint')) {
      logger.error(`Erro de validação do banco de dados: ${error.message}`);
      return NextResponse.json(
        { error: `Erro de validação do banco de dados: ${error.message}` },
        { status: 422 }
      );
    }
    
    // Verificar se é um erro de conexão com o Supabase
    if (error.message.includes('network error') || error.message.includes('connection')) {
      logger.error(`Erro de conexão com o banco de dados: ${error.message}`);
      return NextResponse.json(
        { error: `Erro de conexão com o banco de dados: ${error.message}` },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: `Erro ao processar webhook: ${error.message}` },
      { status: 500 }
    );
  }
}
