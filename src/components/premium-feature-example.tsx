'use client';

import { useState } from 'react';
import { PremiumGate } from './premium-gate';
import { Button } from './ui/button';
import { usePlanLimits, FREE_PLAN_LIMITS } from '@/hooks/usePlanLimits';
import { Badge } from './ui/badge';

/**
 * Componente de exemplo que demonstra como usar o PremiumGate
 * Você pode remover este componente após implementar a funcionalidade em produção
 */
export function PremiumFeatureExample() {
  const [canUseFeature, setCanUseFeature] = useState(false);
  // isPremium já está sendo verificado de forma robusta no hook usePlanLimits
  const { isPremium } = usePlanLimits();

  return (
    <div className="space-y-8 p-6 border rounded-lg">
      <div>
        <h2 className="text-xl font-bold mb-2">Exemplo de Bloqueio Total</h2>
        <p className="text-muted-foreground mb-4">
          Este conteúdo só será visível para usuários Premium:
        </p>
        
        <PremiumGate>
          <div className="p-4 bg-green-100 dark:bg-green-900/20 border border-green-500 rounded-lg">
            <p className="text-green-700 dark:text-green-300">
              Parabéns! Você tem acesso a este conteúdo premium.
            </p>
          </div>
        </PremiumGate>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Exemplo de Verificação</h2>
        <p className="text-muted-foreground mb-4">
          Este exemplo usa o modo <code>softBlock</code> para apenas verificar o status premium:
        </p>
        
        <PremiumGate 
          softBlock 
          onPremiumCheck={(isPremium) => setCanUseFeature(isPremium)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <p>Status da funcionalidade:</p>
              <Badge variant={canUseFeature ? "success" : "destructive"}>
                {canUseFeature ? 'Disponível' : 'Bloqueada'}
              </Badge>
            </div>
            
            <Button 
              disabled={!canUseFeature} 
              variant={canUseFeature ? "default" : "outline"}
            >
              Usar Funcionalidade Premium
            </Button>
            
            {!canUseFeature && (
              <p className="text-sm text-muted-foreground">
                Esta função está disponível apenas no plano Premium.
              </p>
            )}
          </div>
        </PremiumGate>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Limites do Plano</h2>
        <p className="text-muted-foreground mb-4">
          Informações sobre os limites do seu plano atual:
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Seu plano:</span>
            <Badge variant={isPremium ? "success" : "default"}>
              {isPremium ? 'Premium' : 'Free'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Limite de matérias:</span>
            <span className="font-semibold">
              {isPremium ? '∞ (Ilimitado)' : FREE_PLAN_LIMITS.MAX_SUBJECTS}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Conteúdos por matéria:</span>
            <span className="font-semibold">
              {isPremium ? '∞ (Ilimitado)' : FREE_PLAN_LIMITS.MAX_CONTENTS_PER_SUBJECT}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
