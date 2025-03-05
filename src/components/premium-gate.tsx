'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UpgradePremiumDialog } from '@/components/upgrade-premium-dialog';
import { SubscriptionPlan, SubscriptionStatus } from '@/types/subscription';

interface PremiumGateProps {
  /**
   * O conteúdo que será protegido
   */
  children: ReactNode;
  
  /**
   * Mensagem personalizada a ser exibida quando o usuário não tem acesso premium
   * Se não for fornecida, será usada a mensagem padrão
   */
  message?: string;
  
  /**
   * Se true, não bloqueia o conteúdo, apenas verifica se é premium
   * Útil quando queremos verificar sem bloquear ou aplicar alguma lógica personalizada
   */
  softBlock?: boolean;
  
  /**
   * Callback chamado após verificar se o usuário tem acesso premium,
   * permitindo que o componente pai saiba se o usuário tem acesso premium
   */
  onPremiumCheck?: (isPremium: boolean) => void;
  
  /**
   * Classe CSS personalizada para o container do bloqueio
   */
  className?: string;
  
  /**
   * Nome do recurso que está sendo bloqueado (para exibição no dialog de upgrade)
   */
  featureName?: string;
  
  /**
   * Se true, mostra o dialog de upgrade ao invés do banner simples
   */
  useDialog?: boolean;
}

/**
 * Componente que protege conteúdo premium.
 * 
 * Exemplo de uso:
 * ```tsx
 * <PremiumGate>
 *   <ConteudoPremium />
 * </PremiumGate>
 * ```
 * 
 * Ou para apenas verificar sem bloquear:
 * ```tsx
 * <PremiumGate softBlock onPremiumCheck={(isPremium) => setCanCreate(isPremium)}>
 *   <Component canCreate={canCreate} />
 * </PremiumGate>
 * ```
 */
export function PremiumGate({ 
  children, 
  message, 
  softBlock = false, 
  onPremiumCheck,
  className,
  featureName,
  useDialog = false
}: PremiumGateProps) {
  const { subscription, isPremium, isLoading } = useSubscription();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Verificação adicional para garantir que o status premium seja correto
  const isReallyPremium = Boolean(
    !isLoading && 
    subscription && 
    subscription.plan === SubscriptionPlan.PREMIUM && 
    subscription.status === SubscriptionStatus.ACTIVE
  );

  // Chama o callback com o resultado da verificação
  if (onPremiumCheck && !isLoading) {
    onPremiumCheck(isReallyPremium);
  }

  // Se for apenas verificação sem bloqueio, ou se o usuário for premium, mostra o conteúdo
  if (softBlock || isReallyPremium) {
    return <>{children}</>;
  }

  // Se estiver carregando, mostra um placeholder
  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col items-center justify-center p-8 bg-accent/50 rounded-lg">
        <div className="h-8 w-8 rounded-full bg-accent mb-4"></div>
        <div className="h-4 w-1/2 bg-accent mb-2 rounded"></div>
        <div className="h-3 w-1/3 bg-accent rounded"></div>
      </div>
    );
  }

  // Se preferir mostrar o dialog de upgrade
  if (useDialog) {
    return (
      <>
        <UpgradePremiumDialog 
          mode="controlled"
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          featureName={featureName}
        />
        
        <div className={cn(
          "flex flex-col items-center justify-center p-8 bg-accent/10 border border-accent rounded-lg text-center",
          className
        )}>
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Conteúdo Premium</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {message || 'Este recurso está disponível apenas para assinantes do plano Premium.'}
          </p>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Assinar Premium
          </Button>
        </div>
      </>
    );
  }

  // Caso contrário, mostra o bloqueio de conteúdo premium padrão
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 bg-accent/10 border border-accent rounded-lg text-center",
      className
    )}>
      <Lock className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">Conteúdo Premium</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {message || 'Este recurso está disponível apenas para assinantes do plano Premium.'}
      </p>
      <Button 
        onClick={() => router.push('/dashboard/subscription')} 
        className="flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Assinar Premium
      </Button>
    </div>
  );
}
