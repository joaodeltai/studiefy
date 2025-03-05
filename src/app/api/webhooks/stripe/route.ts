import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServerClientWithCookies } from '../../../../lib/supabase/server';
import { stripe, determinePlan } from '../../../../lib/stripe';
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
    // Verifica a assinatura do webhook para garantir que veio do Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    logger.info(`Evento do Stripe processado com sucesso: ${event.type}`, { eventType: event.type });
  } catch (error: any) {
    logger.error(`Erro na assinatura do webhook: ${error.message}`, { error: error.message });
    return NextResponse.json(
      { error: `Erro na assinatura do webhook: ${error.message}` },
      { status: 400 }
    );
  }

  // Cria um cliente Supabase para acessar o banco de dados
  const supabase = await createServerClientWithCookies();

  // Processa diferentes tipos de eventos
  try {
    switch (event.type) {
      // Quando uma assinatura é criada
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        if (!userId) {
          throw new Error('ID do usuário não encontrado nos metadados da sessão');
        }

        // Obtém os detalhes da assinatura do Stripe
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Determina o plano com base no ID do preço
        const priceId = subscription.items.data[0].price.id;
        const plan = determinePlan(priceId);

        // Insere ou atualiza os dados da assinatura no banco de dados
        const { error } = await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          status: subscription.status as SubscriptionStatus,
          plan,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

        if (error) {
          throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
        }

        // Atualiza o plano de assinatura no perfil do usuário
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ subscription_plan: plan })
          .eq('user_id', userId);

        if (profileError) {
          throw new Error(`Erro ao atualizar perfil: ${profileError.message}`);
        }

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
        
        // Busca o usuário pelo ID do cliente Stripe
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (!subscriptionData) {
          throw new Error('Assinatura não encontrada no banco de dados');
        }

        // Determina o plano com base no ID do preço
        const priceId = subscription.items.data[0].price.id;
        const plan = determinePlan(priceId);

        // Atualiza os dados da assinatura no banco de dados
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status as SubscriptionStatus,
            plan,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            stripe_price_id: priceId,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
        }

        // Atualiza o plano de assinatura no perfil do usuário
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ subscription_plan: plan })
          .eq('user_id', subscriptionData.user_id);

        if (profileError) {
          throw new Error(`Erro ao atualizar perfil: ${profileError.message}`);
        }

        logger.info(`Assinatura atualizada com sucesso para o usuário ${subscriptionData.user_id}`, { 
          userId: subscriptionData.user_id, 
          subscriptionId: subscription.id,
          plan,
          status: subscription.status
        });

        break;
      }

      // Quando uma assinatura é cancelada
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Busca o usuário pelo ID do cliente Stripe
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (!subscriptionData) {
          throw new Error('Assinatura não encontrada no banco de dados');
        }

        // Atualiza os dados da assinatura no banco de dados
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status as SubscriptionStatus,
            plan: SubscriptionPlan.FREE,
            cancel_at_period_end: false,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
        }

        // Atualiza o plano de assinatura no perfil do usuário para free
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ subscription_plan: SubscriptionPlan.FREE })
          .eq('user_id', subscriptionData.user_id);

        if (profileError) {
          throw new Error(`Erro ao atualizar perfil: ${profileError.message}`);
        }

        logger.info(`Assinatura cancelada com sucesso para o usuário ${subscriptionData.user_id}`, { 
          userId: subscriptionData.user_id, 
          subscriptionId: subscription.id
        });

        break;
      }

      // Quando um pagamento falha
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        // Buscar a assinatura relacionada
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();
          
        if (!subscriptionData) {
          throw new Error('Assinatura não encontrada no banco de dados');
        }
        
        // Atualizar o status da assinatura para 'past_due'
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due' as SubscriptionStatus,
          })
          .eq('stripe_subscription_id', subscriptionId);
          
        if (error) {
          throw new Error(`Erro ao atualizar status da assinatura: ${error.message}`);
        }
        
        logger.warn(`Falha no pagamento da assinatura ${subscriptionId} para o usuário ${subscriptionData.user_id}`, {
          userId: subscriptionData.user_id,
          subscriptionId,
          invoiceId: invoice.id,
          attemptCount: invoice.attempt_count
        });
        
        // Aqui poderia ser implementado um sistema de notificação ao usuário
        // TODO: Enviar email notificando sobre a falha no pagamento
        
        break;
      }
      
      // Quando um pagamento é bem-sucedido
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (!subscriptionId) {
          logger.warn('Pagamento não associado a uma assinatura', { invoiceId: invoice.id });
          break;
        }
        
        // Buscar a assinatura relacionada
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id, status')
          .eq('stripe_subscription_id', subscriptionId)
          .single();
          
        if (!subscriptionData) {
          throw new Error('Assinatura não encontrada no banco de dados');
        }
        
        // Se o status for past_due, atualizar para active
        if (subscriptionData.status === 'past_due') {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'active' as SubscriptionStatus,
            })
            .eq('stripe_subscription_id', subscriptionId);
            
          if (error) {
            throw new Error(`Erro ao atualizar status da assinatura: ${error.message}`);
          }
          
          logger.info(`Pagamento realizado com sucesso, assinatura ${subscriptionId} reativada para o usuário ${subscriptionData.user_id}`, {
            userId: subscriptionData.user_id,
            subscriptionId,
            invoiceId: invoice.id,
            amountPaid: invoice.amount_paid / 100
          });
          
          // Aqui poderia ser implementado um sistema de notificação ao usuário
          // TODO: Enviar email confirmando o pagamento e a reativação da assinatura
        } else {
          logger.info(`Pagamento processado com sucesso para a assinatura ${subscriptionId}`, {
            userId: subscriptionData.user_id,
            subscriptionId,
            invoiceId: invoice.id,
            amountPaid: invoice.amount_paid / 100
          });
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
    logger.error(`Erro ao processar webhook: ${error.message}`, { 
      eventType: event.type,
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: `Erro ao processar webhook: ${error.message}` },
      { status: 500 }
    );
  }
}
