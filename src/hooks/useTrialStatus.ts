import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionStatus, SubscriptionPlan } from '@/types/subscription';

interface TrialStatus {
  isTrialing: boolean;
  daysRemaining: number | null;
  isExpired: boolean;
  isPremium: boolean;
}

/**
 * Hook para verificar o status do período de teste gratuito do usuário
 * 
 * @returns Objeto com informações sobre o status do trial
 */
export function useTrialStatus(): TrialStatus {
  const { user } = useAuth();
  const [status, setStatus] = useState<TrialStatus>({
    isTrialing: false,
    daysRemaining: null,
    isExpired: false,
    isPremium: false,
  });

  useEffect(() => {
    // Se não houver usuário logado, não faz nada
    if (!user?.id) return;

    // Função para buscar o status da assinatura
    const fetchSubscriptionStatus = async () => {
      try {
        // Busca os dados da assinatura do usuário
        const response = await fetch(`/api/subscriptions/get-subscription?userId=${user.id}`);
        const { data } = await response.json();

        // Se não houver dados de assinatura, retorna status padrão
        if (!data) {
          setStatus({
            isTrialing: false,
            daysRemaining: null,
            isExpired: false,
            isPremium: false,
          });
          return;
        }

        // Verifica se o usuário está em período de teste
        const isTrialing = data.status === SubscriptionStatus.TRIALING;
        
        // Verifica se o usuário tem um plano premium ativo
        const isPremium = 
          data.plan === SubscriptionPlan.PREMIUM && 
          (data.status === SubscriptionStatus.ACTIVE || data.status === SubscriptionStatus.TRIALING);

        // Verifica se o período de teste expirou
        const isExpired = 
          data.status === SubscriptionStatus.EXPIRED || 
          (data.status === SubscriptionStatus.TRIALING && new Date(data.current_period_end) < new Date());

        // Calcula os dias restantes do período de teste
        let daysRemaining = null;
        if (isTrialing && !isExpired) {
          const endDate = new Date(data.current_period_end);
          const now = new Date();
          const diffTime = endDate.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Atualiza o estado com as informações do trial
        setStatus({
          isTrialing,
          daysRemaining,
          isExpired,
          isPremium,
        });
      } catch (error) {
        console.error('Erro ao verificar status do trial:', error);
      }
    };

    // Busca o status da assinatura quando o componente é montado
    fetchSubscriptionStatus();
  }, [user?.id]);

  return status;
}
