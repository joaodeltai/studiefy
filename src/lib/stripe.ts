import Stripe from 'stripe';
import { SubscriptionPlan } from '@/types/subscription';

// Inicializa o cliente Stripe com a chave secreta
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', // Use a versão mais recente da API
  typescript: true,
});

// Função para criar uma sessão de checkout
export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
}: {
  customerId: string;
  priceId: string;
  userId: string;
}) {
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
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
    metadata: {
      userId,
    },
  });

  return session;
}

/**
 * Determina o plano com base no ID do preço
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
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM,
    process.env.STRIPE_PRICE_PREMIUM_TEST,
    process.env.STRIPE_PRICE_PREMIUM_PROD
  ].filter(Boolean); // Remove valores undefined ou vazios
  
  // Se o ID do preço for um dos IDs premium conhecidos, retorna PREMIUM
  if (premiumPriceIds.includes(priceId)) {
    return SubscriptionPlan.PREMIUM;
  }
  
  // Caso contrário, assume que é o plano gratuito
  return SubscriptionPlan.FREE;
}

// Função para verificar o status da assinatura
export async function getSubscriptionStatus(userId: string) {
  const { data: subscription } = await fetch(
    `/api/subscriptions/get-subscription?userId=${userId}`
  ).then((res) => res.json());

  return subscription;
}
