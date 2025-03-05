/**
 * Tipos para o sistema de assinaturas
 */

/**
 * Planos de assinatura disponíveis no sistema
 */
export enum SubscriptionPlan {
  /** Plano gratuito com recursos limitados */
  FREE = 'free',
  /** Plano premium com acesso completo */
  PREMIUM = 'premium'
}

/**
 * Status possíveis de uma assinatura no Stripe
 */
export enum SubscriptionStatus {
  /** Assinatura ativa e em uso */
  ACTIVE = 'active',
  /** Assinatura cancelada */
  CANCELED = 'canceled',
  /** Assinatura em período de carência após falha de pagamento */
  PAST_DUE = 'past_due',
  /** Assinatura em período de teste */
  TRIALING = 'trialing',
  /** Assinatura em processo de cancelamento */
  CANCELING = 'canceling',
  /** Assinatura incompleta (pagamento ainda não confirmado) */
  INCOMPLETE = 'incomplete',
  /** Assinatura expirada por falha de pagamento */
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  /** Assinatura pausada temporariamente */
  PAUSED = 'paused',
  /** Assinatura expirada */
  EXPIRED = 'expired',
  /** Assinatura criada mas ainda não ativa */
  PENDING = 'pending'
}

/**
 * Interface para os dados de assinatura
 */
export interface Subscription {
  id: string;
  user_id: string;
  profile_id?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para perfil de usuário com informação de assinatura
 */
export interface ProfileWithSubscription {
  user_id: string;
  subscription_plan: SubscriptionPlan;
  // Outros campos do perfil...
}
