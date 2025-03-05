'use client';

import { PremiumFeatureExample } from "@/components/premium-feature-example";
import { PremiumGate } from "@/components/premium-gate";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PremiumTestPage() {
  const router = useRouter();
  const { isPremium } = usePlanLimits();

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Teste de Recursos Premium</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Informações
            </h2>
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              Esta página demonstra como os recursos premium são bloqueados para usuários do plano Free.
              {isPremium ? (
                <span className="block mt-2 font-semibold">
                  Você tem o plano Premium, então verá todos os recursos desbloqueados.
                </span>
              ) : (
                <span className="block mt-2 font-semibold">
                  Você está no plano Free, então alguns recursos estarão bloqueados.
                </span>
              )}
            </p>
          </div>

          <PremiumFeatureExample />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Conteúdo Exclusivo</h2>
          <div className="aspect-square w-full rounded-lg overflow-hidden">
            <PremiumGate 
              message="Esta é uma funcionalidade avançada exclusiva para assinantes Premium. Aproveite recursos ilimitados e amplie seus estudos!"
              className="h-full"
            >
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
                <div className="text-center p-6">
                  <h3 className="text-2xl font-bold mb-4">Conteúdo Premium Desbloqueado</h3>
                  <p>
                    Você tem acesso a todos os recursos do Studiefy!
                  </p>
                </div>
              </div>
            </PremiumGate>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PremiumGate>
              <div className="p-6 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex flex-col items-center justify-center text-center h-full">
                <h3 className="font-bold mb-2">Estatísticas Avançadas</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Visualize dados detalhados sobre seu desempenho.
                </p>
              </div>
            </PremiumGate>

            <PremiumGate>
              <div className="p-6 bg-green-100 dark:bg-green-900/20 rounded-lg flex flex-col items-center justify-center text-center h-full">
                <h3 className="font-bold mb-2">Prioridade no Suporte</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Obtenha ajuda prioritária de nossa equipe.
                </p>
              </div>
            </PremiumGate>
          </div>
        </div>
      </div>
    </div>
  );
}
