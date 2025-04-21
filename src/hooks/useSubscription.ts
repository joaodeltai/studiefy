'use client';

import { useState, useEffect } from 'react';
import { useProfile } from './useProfile';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '@/types/subscription';

// Chave para o cache de assinatura no localStorage
const SUBSCRIPTION_CACHE_KEY = 'studiefy:subscription:cache';
// Tempo de expiração do cache em milissegundos (30 minutos)
const CACHE_EXPIRATION_TIME = 30 * 60 * 1000;

// Interface para o objeto de cache
interface SubscriptionCache {
  subscription: Subscription | null;
  isPremium: boolean;
  timestamp: number;
}

// Interface para log de assinatura
interface SubscriptionLog {
  id: string;
  user_id: string;
  subscription_id: string;
  old_status: string | null;
  new_status: string;
  old_plan: string | null;
  new_plan: string;
  changed_at: string;
  reason: string | null;
  processed_by: string;
}

export function useSubscription() {
  const { profile } = useProfile();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  // Importante: iniciamos isPremium como false para garantir que
  // usuários novos não tenham acesso premium incorretamente
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);

  // Função para salvar o cache no localStorage
  const saveSubscriptionCache = (subscriptionData: Subscription | null) => {
    try {
      const isPremiumValue = Boolean(
        subscriptionData && 
        subscriptionData.plan === SubscriptionPlan.PREMIUM && 
        (subscriptionData.status === SubscriptionStatus.ACTIVE || subscriptionData.status === SubscriptionStatus.TRIALING)
      );
      
      const cacheData: SubscriptionCache = {
        subscription: subscriptionData,
        isPremium: isPremiumValue,
        timestamp: Date.now()
      };
      
      localStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(cacheData));
      setIsPremium(isPremiumValue);
    } catch (error) {
      console.error('Erro ao salvar cache de assinatura:', error);
    }
  };

  // Função para carregar o cache do localStorage
  const loadSubscriptionCache = (): SubscriptionCache | null => {
    try {
      const cachedData = localStorage.getItem(SUBSCRIPTION_CACHE_KEY);
      
      if (!cachedData) return null;
      
      const parsedCache = JSON.parse(cachedData) as SubscriptionCache;
      
      // Verificar se o cache está expirado
      if (Date.now() - parsedCache.timestamp > CACHE_EXPIRATION_TIME) {
        localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
        return null;
      }
      
      return parsedCache;
    } catch (error) {
      console.error('Erro ao carregar cache de assinatura:', error);
      return null;
    }
  };

  // Função para limpar o cache de assinatura
  const clearSubscriptionCache = () => {
    try {
      localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
      console.log('Cache de assinatura removido');
    } catch (error) {
      console.error('Erro ao remover cache de assinatura:', error);
    }
  };

  // Função para buscar logs recentes de assinatura
  const fetchRecentSubscriptionLogs = async (): Promise<SubscriptionLog | null> => {
    if (!profile?.user_id) return null;
    
    try {
      const { data, error } = await supabase
        .from('subscription_logs')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('changed_at', { ascending: false })
        .limit(1);
        
      if (error) {
        console.error('Erro ao buscar logs de assinatura:', error);
        return null;
      }
      
      return data.length > 0 ? data[0] as SubscriptionLog : null;
    } catch (error) {
      console.error('Erro ao buscar logs de assinatura:', error);
      return null;
    }
  };

  const fetchSubscription = async (forceRefresh = false) => {
    if (!profile?.user_id) return;

    // Se não for forçado a atualizar, verifique o cache primeiro
    if (!forceRefresh) {
      const cachedData = loadSubscriptionCache();
      if (cachedData) {
        setSubscription(cachedData.subscription);
        
        // Verificar explicitamente se a assinatura em cache é válida para premium
        const isPremiumValue = Boolean(
          cachedData.subscription && 
          cachedData.subscription.plan === SubscriptionPlan.PREMIUM && 
          (cachedData.subscription.status === SubscriptionStatus.ACTIVE || cachedData.subscription.status === SubscriptionStatus.TRIALING)
        );
        setIsPremium(isPremiumValue);
        setIsLoading(false);
        
        // Verificar se a assinatura no cache está expirada com base no current_period_end
        if (cachedData.subscription?.plan === SubscriptionPlan.PREMIUM && 
            cachedData.subscription?.current_period_end) {
          
          const endDate = new Date(cachedData.subscription.current_period_end);
          const now = new Date();
          
          // Se já passou da data de término da assinatura, forçar atualização
          if (now > endDate) {
            console.log('Assinatura potencialmente expirada, forçando atualização');
            fetchSubscription(true);
            return;
          }
        }
        
        // Após recuperar do cache, força a atualização em segundo plano se o cache estiver prestes a expirar
        // (dentro dos últimos 5 minutos para expirar)
        const cacheAge = Date.now() - cachedData.timestamp;
        if (cacheAge > (CACHE_EXPIRATION_TIME - 5 * 60 * 1000)) {
          fetchSubscription(true);
        }
      } else {
        fetchSubscription(true);
      }
    } else {
      // Se forçar atualização, limpe o cache atual
      clearSubscriptionCache();
    }

    try {
      setIsLoading(true);
      
      // Primeiro, verificar se há logs recentes que indicam uma mudança de status/plano
      const recentLog = await fetchRecentSubscriptionLogs();
      let shouldCheckDatabase = true;
      
      // Se encontrou um log recente (nas últimas 6 horas) que indica alteração para free
      if (recentLog && 
          new Date(recentLog.changed_at) > new Date(Date.now() - 6 * 60 * 60 * 1000) &&
          recentLog.new_plan === 'free') {
        
        console.log('Log recente encontrado indicando mudança para plano free');
        
        // Se a assinatura atual for diferente do que está no log, atualize
        if (subscription?.plan !== SubscriptionPlan.FREE) {
          setSubscription({
            ...subscription as Subscription,
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.EXPIRED
          });
          setIsPremium(false);
          
          // Ainda fazemos a verificação no banco para garantir dados atualizados
          // mas não precisamos atualizar o estado novamente se já encontramos logs recentes
          shouldCheckDatabase = true;
        }
      }
      
      // Continuar com a verificação no banco de dados
      if (shouldCheckDatabase) {
        // Usando maybeSingle() em vez de single() para evitar o erro 406
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', profile.user_id)
          .maybeSingle();

        if (error) {
          console.log('Erro ao buscar assinatura:', error);
          
          if (error.code === '406') {
            // Erro 406 Not Acceptable - problema com headers ou formato de resposta
            console.error('Erro 406 ao buscar assinatura. Possível problema com headers ou formato de resposta:', error);
            // Definir subscription como null e continuar sem mostrar erro para o usuário
            setSubscription(null);
            saveSubscriptionCache(null);
          } else {
            console.error('Erro ao buscar assinatura:', error);
            // Quando há erro, definimos como null para não bloquear a aplicação
            setSubscription(null);
            saveSubscriptionCache(null);
          }
        } else if (data) {
          // Verificar se é uma assinatura premium ativa com ID do Stripe
          if (data.plan === SubscriptionPlan.PREMIUM && 
              (data.status === SubscriptionStatus.ACTIVE || data.status === SubscriptionStatus.TRIALING) &&
              data.stripe_subscription_id) {
            
            // Verificar se a assinatura está prestes a expirar ou se os campos do Stripe estão vazios
            const endDate = data.current_period_end ? new Date(data.current_period_end) : null;
            const now = new Date();
            const daysUntilExpiration = endDate ? Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : -1;
            const hasEmptyStripeFields = !data.stripe_customer_id || data.stripe_customer_id === '' || 
                                       !data.stripe_subscription_id || data.stripe_subscription_id === '' || 
                                       !data.stripe_price_id || data.stripe_price_id === '';
            
            // Se estiver a menos de 3 dias da expiração ou se os campos do Stripe estiverem vazios, verificar com o Stripe
            if (daysUntilExpiration <= 3 || hasEmptyStripeFields) {
              try {
                // Verificar com o Stripe via API
                console.log('Verificando assinatura com o Stripe:', data.stripe_subscription_id);
                const response = await fetch(`/api/subscriptions/check-subscription?subscriptionId=${data.stripe_subscription_id}`);
                
                if (response.ok) {
                  const stripeData = await response.json();
                  
                  if (stripeData.success && stripeData.subscription) {
                    console.log('Dados atualizados do Stripe:', stripeData.subscription);
                    
                    // Atualizar com os dados do Stripe
                    const updatedSubscription = {
                      ...data,
                      status: stripeData.subscription.status as SubscriptionStatus,
                      current_period_start: stripeData.subscription.current_period_start,
                      current_period_end: stripeData.subscription.current_period_end,
                      cancel_at_period_end: stripeData.subscription.cancel_at_period_end,
                      updated_at: new Date().toISOString()
                    };
                    
                    // Atualizar o estado
                    setSubscription(updatedSubscription);
                    
                    // Verificar se o status premium mudou
                    const isPremiumValue = Boolean(
                      updatedSubscription.plan === SubscriptionPlan.PREMIUM && 
                      (updatedSubscription.status === SubscriptionStatus.ACTIVE || updatedSubscription.status === SubscriptionStatus.TRIALING)
                    );
                    setIsPremium(isPremiumValue);
                    
                    // Salvar no cache
                    saveSubscriptionCache(updatedSubscription);
                    
                    // Salvar os dados atualizados no banco
                    const { error: updateError } = await supabase
                      .from('subscriptions')
                      .update({
                        status: updatedSubscription.status,
                        current_period_start: updatedSubscription.current_period_start,
                        current_period_end: updatedSubscription.current_period_end,
                        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
                        updated_at: updatedSubscription.updated_at
                      })
                      .eq('id', data.id);
                      
                    if (updateError) {
                      console.error('Erro ao atualizar assinatura no banco:', updateError);
                    }
                    
                    // Se o status mudou para não-premium, atualizar o perfil
                    if (!isPremiumValue && profile?.subscription_plan === SubscriptionPlan.PREMIUM) {
                      try {
                        const { error: profileError } = await supabase
                          .from('profiles')
                          .update({ subscription_plan: SubscriptionPlan.FREE })
                          .eq('user_id', profile.user_id);
                          
                        if (profileError) {
                          console.error('Erro ao atualizar perfil:', profileError);
                        }
                      } catch (err) {
                        console.error('Erro inesperado ao atualizar perfil:', err);
                      }
                    }
                    
                    return;
                  }
                } else {
                  console.error('Erro ao verificar assinatura no Stripe:', await response.text());
                }
              } catch (error) {
                console.error('Erro ao verificar assinatura no Stripe:', error);
              }
            }
          }
          
          // Se não verificou com o Stripe ou se a verificação falhou, continuar com os dados do banco
          setSubscription(data);
          
          // Reforçar a verificação de premium
          const isPremiumValue = Boolean(
            data.plan === SubscriptionPlan.PREMIUM && 
            (data.status === SubscriptionStatus.ACTIVE || data.status === SubscriptionStatus.TRIALING)
          );
          
          // Define explicitamente o isPremium baseado na verificação
          setIsPremium(isPremiumValue);
          
          // Salva no cache
          saveSubscriptionCache(data);
          
          // Também atualiza o perfil se necessário
          if (profile?.subscription_plan !== data.plan) {
            try {
              const { error: profileError } = await supabase
                .from('profiles')
                .update({ subscription_plan: data.plan })
                .eq('user_id', profile.user_id);
                
              if (profileError) {
                console.error('Erro ao atualizar perfil:', profileError);
              }
            } catch (err) {
              console.error('Erro inesperado:', err);
            }
          }
        } else {
          // Se não encontrou uma assinatura, criar uma assinatura gratuita
          try {
            const newSubscription = {
              user_id: profile.user_id,
              profile_id: profile.id,
              plan: SubscriptionPlan.FREE,
              status: SubscriptionStatus.ACTIVE,
              period: 'monthly',
              stripe_customer_id: null,
              stripe_subscription_id: null,
              stripe_price_id: null,
              current_period_start: null,
              current_period_end: null,
              cancel_at_period_end: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const { data: insertedData, error: insertError } = await supabase
              .from('subscriptions')
              .insert(newSubscription)
              .select()
              .single();
              
            if (insertError) {
              console.error('Erro ao criar assinatura gratuita:', insertError);
              setSubscription(null);
            } else {
              console.log('Assinatura gratuita criada com sucesso:', insertedData);
              setSubscription(insertedData);
              setIsPremium(false);
              saveSubscriptionCache(insertedData);
              
              // Atualizar o perfil se necessário
              if (profile?.subscription_plan !== SubscriptionPlan.FREE) {
                try {
                  const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ subscription_plan: SubscriptionPlan.FREE })
                    .eq('user_id', profile.user_id);
                    
                  if (profileError) {
                    console.error('Erro ao atualizar perfil:', profileError);
                  }
                } catch (err) {
                  console.error('Erro inesperado ao atualizar perfil:', err);
                }
              }
            }
          } catch (error) {
            console.error('Erro ao criar assinatura gratuita:', error);
            setSubscription(null);
            saveSubscriptionCache(null);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      // Quando há erro, definimos como null para não bloquear a aplicação
      setSubscription(null);
      saveSubscriptionCache(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckoutSession = async (priceId: string) => {
    try {
      const response = await fetch('/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }

      return data.url;
    } catch (error: any) {
      console.error('Erro ao criar sessão de checkout');
      toast.error(error.message || 'Ocorreu um erro ao processar sua assinatura');
      return null;
    }
  };

  const cancelSubscription = async () => {
    try {
      setIsCanceling(true);

      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cancelar assinatura');
      }

      // Após cancelamento, forçar atualização do cache
      await fetchSubscription(true);

      toast.success('Assinatura cancelada com sucesso', {
        description: 'Você continuará tendo acesso aos recursos premium até o fim do período atual.',
      });

      // Atualizar a subscription local para mostrar cancelamento pending
      setSubscription(subscription ? {
        ...subscription,
        cancel_at_period_end: true
      } : null);
      
      return true;
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura');
      toast.error(error.message || 'Ocorreu um erro ao cancelar sua assinatura');
      return false;
    } finally {
      setIsCanceling(false);
    }
  };

  useEffect(() => {
    if (profile?.user_id) {
      // Forçar uma limpeza do cache na inicialização para garantir verificação atualizada
      clearSubscriptionCache();
      
      const cachedData = loadSubscriptionCache();
      
      if (cachedData) {
        setSubscription(cachedData.subscription);
        
        // Verificar explicitamente se a assinatura em cache é válida para premium
        const isPremiumValue = Boolean(
          cachedData.subscription && 
          cachedData.subscription.plan === SubscriptionPlan.PREMIUM && 
          (cachedData.subscription.status === SubscriptionStatus.ACTIVE || cachedData.subscription.status === SubscriptionStatus.TRIALING)
        );
        setIsPremium(isPremiumValue);
        setIsLoading(false);
        
        // Verificar se a assinatura no cache está expirada com base no current_period_end
        if (cachedData.subscription?.plan === SubscriptionPlan.PREMIUM && 
            cachedData.subscription?.current_period_end) {
          
          const endDate = new Date(cachedData.subscription.current_period_end);
          const now = new Date();
          
          // Se já passou da data de término da assinatura, forçar atualização
          if (now > endDate) {
            console.log('Assinatura potencialmente expirada, forçando atualização');
            fetchSubscription(true);
            return;
          }
        }
        
        // Após recuperar do cache, força a atualização em segundo plano se o cache estiver prestes a expirar
        // (dentro dos últimos 5 minutos para expirar)
        const cacheAge = Date.now() - cachedData.timestamp;
        if (cacheAge > (CACHE_EXPIRATION_TIME - 5 * 60 * 1000)) {
          fetchSubscription(true);
        }
      } else {
        fetchSubscription(true);
      }
    }
  }, [profile?.user_id]);

  useEffect(() => {
    // Garantir que o estado de isPremium seja sempre atualizado
    // quando a subscription mudar
    if (subscription) {
      const isPremiumValue = Boolean(
        subscription.plan === SubscriptionPlan.PREMIUM && 
        (subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.TRIALING)
      );
      setIsPremium(isPremiumValue);
      saveSubscriptionCache(subscription);
    } else {
      // Se não tiver subscription, garantir que isPremium seja false
      setIsPremium(false);
      // E limpar o cache para não manter valores antigos
      clearSubscriptionCache();
    }
  }, [subscription]);

  // Adicionar efeito para forçar verificação periódica do status da assinatura
  // mesmo durante o uso ativo da aplicação
  useEffect(() => {
    // Pular se não houver um usuário autenticado
    if (!profile?.user_id) return;
    
    // Pular se não houver uma assinatura ativa no estado
    if (!subscription || subscription?.plan !== SubscriptionPlan.PREMIUM) return;
    
    // Verificar a assinatura a cada 10 minutos se o usuário estiver ativo na aplicação
    const checkInterval = setInterval(() => {
      fetchSubscription(true);
    }, 10 * 60 * 1000); // 10 minutos
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(checkInterval);
  }, [profile?.user_id, subscription?.plan]);

  return {
    subscription,
    isLoading,
    isCanceling,
    // Reforçando a verificação do isPremium para garantir que seja sempre
    // baseado no estado atual da assinatura
    isPremium: Boolean(
      !isLoading && 
      subscription && 
      subscription.plan === SubscriptionPlan.PREMIUM && 
      (subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.TRIALING)
    ),
    willCancel: subscription?.cancel_at_period_end || false,
    fetchSubscription,
    createCheckoutSession,
    cancelSubscription,
    clearSubscriptionCache,
  };
}
