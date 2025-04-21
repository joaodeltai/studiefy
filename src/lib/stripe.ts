import Stripe from 'stripe';
import { SubscriptionPlan, SubscriptionPeriod } from '@/types/subscription';

// Constantes para os IDs dos planos premium (podem ser usadas no cliente)
export const PREMIUM_MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM;
export const PREMIUM_ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL;

// Inicializa o cliente Stripe com a chave secreta (apenas para uso no servidor)
// Verificamos se estamos no servidor antes de inicializar o cliente Stripe
let stripe: Stripe | null = null;
if (typeof window === 'undefined' && process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil' as any, // Atualizado para a versão mais recente da API
    typescript: true,
  });
}

// Exporta o cliente Stripe (apenas para uso no servidor)
export { stripe };

// Função para criar uma sessão de checkout (apenas para uso no servidor)
export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
}: {
  customerId: string;
  priceId: string;
  userId: string;
}) {
  if (!stripe) {
    throw new Error('Stripe não foi inicializado. Esta função só pode ser chamada no servidor.');
  }

  // Verifica se o customerId é válido
  if (!customerId || customerId.trim() === '') {
    throw new Error('ID do cliente inválido ou vazio');
  }

  // Verifica se o priceId é válido
  if (!priceId || priceId.trim() === '') {
    throw new Error('ID do preço inválido ou vazio');
  }

  try {
    console.log(`Criando sessão de checkout para cliente ${customerId} com preço ${priceId}`);
    
    // Cria uma sessão de checkout com o cliente e preço especificados
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
      metadata: {
        userId,
      },
    });

    console.log(`Sessão de checkout criada com sucesso: ${session.id}`);
    return session;
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error);
    throw new Error(`Erro ao criar sessão de checkout: ${error.message}`);
  }
}

/**
 * Determina o plano com base no ID do preço (pode ser usada no cliente)
 * 
 * Esta função é usada para converter IDs de preço do Stripe em planos do sistema.
 * Funciona tanto para IDs de teste quanto para IDs de produção.
 * 
 * @param priceId O ID do preço do Stripe
 * @returns O plano correspondente
 */
export function determinePlan(priceId: string): SubscriptionPlan {
  // IDs de preço premium (tanto teste quanto produção)
  const premiumPriceIds = [
    PREMIUM_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRICE_PREMIUM_TEST,
    process.env.STRIPE_PRICE_PREMIUM_PROD,
    PREMIUM_ANNUAL_PRICE_ID,
  ].filter(Boolean); // Remove valores undefined ou vazios
  
  // Se o ID do preço for um dos IDs premium conhecidos, retorna PREMIUM
  if (premiumPriceIds.includes(priceId)) {
    return SubscriptionPlan.PREMIUM;
  }
  
  // Caso contrário, assume que é o plano gratuito
  return SubscriptionPlan.FREE;
}

/**
 * Determina o período da assinatura com base no ID do preço (pode ser usada no cliente)
 * 
 * @param priceId O ID do preço do Stripe
 * @returns O período da assinatura (mensal ou anual)
 */
export function determinePeriod(priceId: string): SubscriptionPeriod {
  // Se o ID do preço for o do plano anual, retorna ANNUAL
  if (priceId === PREMIUM_ANNUAL_PRICE_ID) {
    return SubscriptionPeriod.ANNUAL;
  }
  
  // Caso contrário, assume que é mensal
  return SubscriptionPeriod.MONTHLY;
}

// Função para verificar o status da assinatura (pode ser usada no cliente)
export async function getSubscriptionStatus(userId: string) {
  const { data: subscription } = await fetch(
    `/api/subscriptions/get-subscription?userId=${userId}`
  ).then((res) => res.json());

  return subscription;
}
