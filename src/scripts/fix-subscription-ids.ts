/**
 * Script para corrigir os IDs de assinatura do Stripe
 * Este script busca todas as assinaturas que têm stripe_customer_id mas não têm stripe_subscription_id
 * e tenta obter o ID da assinatura diretamente da API do Stripe
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { SubscriptionStatus } from '../types/subscription';

// Carrega as variáveis de ambiente
dotenv.config();

// Inicializa o cliente Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('Variável de ambiente STRIPE_SECRET_KEY não configurada');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-03-31.basil' as any, // Atualizado para a versão mais recente da API
});

// Cria um cliente Supabase com a chave de serviço
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSubscriptionIds() {
  console.log('Iniciando correção de IDs de assinatura...');

  try {
    // 1. Buscar todas as assinaturas que têm stripe_customer_id mas não têm stripe_subscription_id
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .not('stripe_customer_id', 'is', null)
      .is('stripe_subscription_id', null);

    if (error) {
      throw new Error(`Erro ao buscar assinaturas: ${error.message}`);
    }

    console.log(`Encontradas ${subscriptions.length} assinaturas com stripe_customer_id mas sem stripe_subscription_id`);

    // 2. Para cada assinatura, buscar as assinaturas do cliente no Stripe
    let updatedCount = 0;
    let errorCount = 0;

    for (const subscription of subscriptions) {
      try {
        console.log(`Processando assinatura ${subscription.id} para o cliente ${subscription.stripe_customer_id}`);
        
        // Buscar todas as assinaturas do cliente no Stripe
        const stripeSubscriptions = await stripe.subscriptions.list({
          customer: subscription.stripe_customer_id,
          limit: 5, // Limitar a 5 assinaturas por cliente
        });

        if (stripeSubscriptions.data.length > 0) {
          // Usar a assinatura mais recente
          const latestSubscription = stripeSubscriptions.data[0];
          console.log(`Encontrada assinatura ${latestSubscription.id} para o cliente ${subscription.stripe_customer_id}`);
          
          // Atualizar a assinatura no banco de dados
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              stripe_subscription_id: latestSubscription.id,
              status: latestSubscription.status as SubscriptionStatus,
              current_period_start: new Date(latestSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(latestSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: latestSubscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

          if (updateError) {
            throw new Error(`Erro ao atualizar assinatura ${subscription.id}: ${updateError.message}`);
          }

          updatedCount++;
          console.log(`Assinatura ${subscription.id} atualizada com sucesso`);
        } else {
          console.log(`Nenhuma assinatura encontrada no Stripe para o cliente ${subscription.stripe_customer_id}`);
        }
      } catch (subscriptionError) {
        console.error(`Erro ao processar assinatura ${subscription.id}:`, subscriptionError);
        errorCount++;
      }
    }

    console.log('\nResumo da operação:');
    console.log(`Total de assinaturas processadas: ${subscriptions.length}`);
    console.log(`Assinaturas atualizadas: ${updatedCount}`);
    console.log(`Erros: ${errorCount}`);

  } catch (error) {
    console.error('Erro ao executar o script:', error);
  }
}

// Executa a função principal
fixSubscriptionIds()
  .then(() => {
    console.log('Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
