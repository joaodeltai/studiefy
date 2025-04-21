/**
 * Script para corrigir os IDs do Stripe nas assinaturas existentes
 * e garantir que todas as assinaturas tenham um status válido
 */

import { createClient } from '@supabase/supabase-js';
import { SubscriptionStatus } from '../types/subscription';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Cria um cliente Supabase com a chave de serviço
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSubscriptions() {
  console.log('Iniciando correção de assinaturas...');

  try {
    // 1. Buscar todas as assinaturas
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*');

    if (error) {
      throw new Error(`Erro ao buscar assinaturas: ${error.message}`);
    }

    console.log(`Encontradas ${subscriptions.length} assinaturas`);

    // 2. Verificar e corrigir cada assinatura
    let updatedCount = 0;
    let errorCount = 0;

    for (const subscription of subscriptions) {
      try {
        const updates: Record<string, any> = {};
        let needsUpdate = false;

        // Verificar se o status é nulo e corrigir
        if (!subscription.status) {
          updates.status = SubscriptionStatus.ACTIVE; // Define um status padrão
          needsUpdate = true;
          console.log(`Assinatura ${subscription.id} sem status, definindo como ACTIVE`);
        }

        // Verificar se há IDs do Stripe vazios ou nulos
        if (!subscription.stripe_customer_id && subscription.user_id) {
          // Aqui você poderia buscar o ID do cliente no Stripe se tivesse acesso à API
          // Por enquanto, apenas registramos o problema
          console.log(`Assinatura ${subscription.id} sem stripe_customer_id`);
        }

        if (!subscription.stripe_subscription_id && subscription.plan === 'premium') {
          console.log(`Assinatura premium ${subscription.id} sem stripe_subscription_id`);
        }

        // Se precisar atualizar, faça a atualização
        if (needsUpdate) {
          updates.updated_at = new Date().toISOString();
          
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update(updates)
            .eq('id', subscription.id);

          if (updateError) {
            throw new Error(`Erro ao atualizar assinatura ${subscription.id}: ${updateError.message}`);
          }

          updatedCount++;
          console.log(`Assinatura ${subscription.id} atualizada com sucesso`);
        }
      } catch (subscriptionError) {
        console.error(`Erro ao processar assinatura ${subscription.id}:`, subscriptionError);
        errorCount++;
      }
    }

    console.log('\nResumo da operação:');
    console.log(`Total de assinaturas: ${subscriptions.length}`);
    console.log(`Assinaturas atualizadas: ${updatedCount}`);
    console.log(`Erros: ${errorCount}`);

  } catch (error) {
    console.error('Erro ao executar o script:', error);
  }
}

// Executa a função principal
fixSubscriptions()
  .then(() => {
    console.log('Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
