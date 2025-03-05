"use client";

import { ReactNode, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { UpgradePremiumDialog } from "@/components/upgrade-premium-dialog";
import { AlertCircle, Sparkles } from "lucide-react";
import { SubscriptionPlan, SubscriptionStatus } from "@/types/subscription";

interface PremiumLimitGateProps {
  /**
   * Conteúdo que será renderizado caso o usuário não tenha atingido o limite
   */
  children: ReactNode;
  
  /**
   * Valor atual do uso (exemplo: número de matérias criadas)
   */
  currentCount: number;
  
  /**
   * Limite máximo permitido para o plano gratuito
   */
  freeLimit: number;
  
  /**
   * Nome do recurso limitado (ex: "matérias", "conteúdos", etc.)
   */
  resourceName: string;
  
  /**
   * Texto de título personalizado para a mensagem de limite atingido
   */
  limitTitle?: string;
  
  /**
   * Texto personalizado para a mensagem de limite atingido
   */
  limitMessage?: string;
}

/**
 * Componente para controlar limites baseados em plano.
 * Bloqueia ou permite o acesso baseado no uso atual e no limite do plano.
 * 
 * Exemplo: 
 * ```tsx
 * <PremiumLimitGate
 *   currentCount={subjects.length}
 *   freeLimit={3}
 *   resourceName="matérias"
 * >
 *   <CreateSubjectButton />
 * </PremiumLimitGate>
 * ```
 */
export function PremiumLimitGate({
  children,
  currentCount,
  freeLimit,
  resourceName,
  limitTitle,
  limitMessage
}: PremiumLimitGateProps) {
  const { subscription, isPremium } = useSubscription();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Verificação adicional para garantir que o status premium seja correto
  const isReallyPremium = Boolean(
    subscription && 
    subscription.plan === SubscriptionPlan.PREMIUM && 
    subscription.status === SubscriptionStatus.ACTIVE
  );
  
  // Se for premium, não há restrição de uso
  if (isReallyPremium) {
    return <>{children}</>;
  }
  
  // Verifica se o usuário atingiu o limite para o plano gratuito
  const reachedLimit = currentCount >= freeLimit;
  
  // Se não atingiu o limite, mostra o conteúdo normalmente
  if (!reachedLimit) {
    return <>{children}</>;
  }
  
  // Título padrão se não for fornecido
  const defaultTitle = `Limite de ${resourceName} atingido`;
  
  // Mensagem padrão se não for fornecida
  const defaultMessage = `Você atingiu o limite de ${freeLimit} ${resourceName} do plano gratuito. Faça o upgrade para o plano Premium para ter acesso ilimitado.`;
  
  // Se atingiu o limite, mostra a mensagem de limite atingido
  return (
    <>
      <UpgradePremiumDialog
        mode="controlled"
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={`Desbloqueie ${resourceName} ilimitados`}
        description={`O plano Premium permite criar quantos ${resourceName} você precisar, sem limitações.`}
        featureName={resourceName}
      />
      
      <div className="flex flex-col items-center justify-center p-6 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded-lg text-center">
        <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">
          {limitTitle || defaultTitle}
        </h3>
        <p className="text-amber-700 dark:text-amber-400 mb-4 max-w-md text-sm">
          {limitMessage || defaultMessage}
        </p>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Upgrade para Premium
        </Button>
      </div>
    </>
  );
}
