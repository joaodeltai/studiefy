import { SubscriptionPeriod } from '@/types/subscription';

// Constantes para os IDs dos planos premium (podem ser usadas no cliente)
export const PREMIUM_MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM;
export const PREMIUM_ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL;

/**
 * Determina o período da assinatura com base no ID do preço
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
