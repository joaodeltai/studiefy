import { NextResponse } from 'next/server';
import { createServerClientWithCookies as createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { SubscriptionStatus, SubscriptionPlan } from '@/types/subscription';

/**
 * API para processar assinaturas expiradas
 * 
 * Esta API u00e9 chamada por um job cron para verificar assinaturas que expiraram
 * e atualizar seu status no banco de dados. Tambu00e9m verifica no Stripe para
 * confirmar que a assinatura realmente expirou antes de marcu00e1-la como expirada.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const now = new Date();
    const processedSubscriptions = [];
    const errors = [];
    
    // Buscar assinaturas que estu00e3o ativas ou em trial, mas com data de tu00e9rmino no passado
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .in('status', [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING])
      .lt('current_period_end', now.toISOString())
      .eq('plan', SubscriptionPlan.PREMIUM);
    
    if (error) {
      console.error('Erro ao buscar assinaturas expiradas:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao buscar assinaturas expiradas', 
        details: error.message 
      }, { status: 500 });
    }
    
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Nenhuma assinatura expirada encontrada', 
        processed: 0 
      });
    }
    
    console.log(`Encontradas ${subscriptions.length} assinaturas potencialmente expiradas`);
    
    // Processar cada assinatura
    for (const subscription of subscriptions) {
      try {
        // Se tiver ID do Stripe, verificar no Stripe antes de marcar como expirada
        if (subscription.stripe_subscription_id && stripe) {
          try {
            const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
            
            // Se a assinatura ainda estiver ativa no Stripe, atualizar os dados no banco
            if (stripeSubscription.status === 'active' || stripeSubscription.status === 'trialing') {
              const { error: updateError } = await supabase
                .from('subscriptions')
                .update({
                  status: stripeSubscription.status as SubscriptionStatus,
                  current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                  cancel_at_period_end: stripeSubscription.cancel_at_period_end,
                  updated_at: new Date().toISOString()
                })
                .eq('id', subscription.id);
              
              if (updateError) {
                throw new Error(`Erro ao atualizar assinatura do Stripe: ${updateError.message}`);
              }
              
              processedSubscriptions.push({
                id: subscription.id,
                user_id: subscription.user_id,
                action: 'updated_from_stripe',
                new_status: stripeSubscription.status
              });
              
              continue; // Pular para a pru00f3xima assinatura
            }
          } catch (stripeError: any) {
            // Se o erro for porque a assinatura nu00e3o existe mais no Stripe, continuar com a marcau00e7u00e3o como expirada
            if (stripeError.type === 'StripeInvalidRequestError' && stripeError.raw?.statusCode === 404) {
              console.log(`Assinatura ${subscription.id} nu00e3o encontrada no Stripe, marcando como expirada`);
            } else {
              // Para outros erros, registrar e continuar
              console.error(`Erro ao verificar assinatura ${subscription.id} no Stripe:`, stripeError);
              errors.push({
                subscription_id: subscription.id,
                error: stripeError.message
              });
            }
          }
        }
        
        // Marcar a assinatura como expirada
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: SubscriptionStatus.EXPIRED,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);
        
        if (updateError) {
          throw new Error(`Erro ao marcar assinatura como expirada: ${updateError.message}`);
        }
        
        // Registrar a mudanu00e7a no log de assinaturas
        const { error: logError } = await supabase
          .from('subscription_logs')
          .insert({
            user_id: subscription.user_id,
            old_plan: subscription.plan,
            new_plan: SubscriptionPlan.FREE,
            old_status: subscription.status,
            new_status: SubscriptionStatus.EXPIRED,
            changed_at: new Date().toISOString(),
            reason: 'Assinatura expirada automaticamente'
          });
        
        if (logError) {
          console.error(`Erro ao registrar log para assinatura ${subscription.id}:`, logError);
        }
        
        // Atualizar o plano no perfil do usuu00e1rio
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ subscription_plan: SubscriptionPlan.FREE })
          .eq('user_id', subscription.user_id);
        
        if (profileError) {
          console.error(`Erro ao atualizar perfil para assinatura ${subscription.id}:`, profileError);
        }
        
        processedSubscriptions.push({
          id: subscription.id,
          user_id: subscription.user_id,
          action: 'marked_as_expired',
          old_status: subscription.status,
          new_status: SubscriptionStatus.EXPIRED
        });
        
      } catch (error: any) {
        console.error(`Erro ao processar assinatura ${subscription.id}:`, error);
        errors.push({
          subscription_id: subscription.id,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processadas ${processedSubscriptions.length} assinaturas expiradas`,
      processed: processedSubscriptions,
      errors: errors.length > 0 ? errors : null
    });
    
  } catch (error: any) {
    console.error('Erro ao processar assinaturas expiradas:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao processar assinaturas expiradas', 
      details: error.message 
    }, { status: 500 });
  }
}
