"use client"

import { ReactNode } from "react"
import { PremiumGate } from "@/components/premium-gate"
import { ChartBar, Presentation, BookOpen, AreaChart, CheckCircle } from "lucide-react"
import { useSubscription } from "@/hooks/useSubscription"

interface PremiumGradesPageProps {
  children: ReactNode
}

/**
 * Componente que envolve a página de Notas com uma restrição premium.
 * Bloqueia completamente a funcionalidade para usuários free.
 */
export function PremiumGradesPage({ children }: PremiumGradesPageProps) {
  const { isPremium } = useSubscription();
  
  const customMessage = `
    A página de Notas é uma funcionalidade premium que permite:
    
    • Visualizar todas as suas notas em um só lugar
    • Acompanhar sua evolução ao longo do tempo
    • Calcular médias por matéria e período 
    • Analisar estatísticas de desempenho
  `;

  // Para usuários premium, mostra o conteúdo normal
  if (isPremium) {
    return <>{children}</>;
  }

  // Para usuários free, mostra apenas o banner premium
  return (
    <div className="h-full p-4 md:p-8 pt-6">
      {/* Header - Mantém apenas o cabeçalho para contexto */}
      <div className="flex items-center mb-8">
        <h1 className="text-2xl font-bold">Notas</h1>
      </div>
      
      {/* Conteúdo Premium */}
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-semibold mb-4">Acesso Premium Necessário</h2>
            
            <p className="text-gray-600 mb-6">
              {customMessage}
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-md">
              <div className="flex items-center gap-1 text-sm">
                <ChartBar className="h-4 w-4 text-emerald-500" />
                <span>Estatísticas completas</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Presentation className="h-4 w-4 text-emerald-500" />
                <span>Evolução de notas</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <BookOpen className="h-4 w-4 text-emerald-500" />
                <span>Notas por matéria</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <AreaChart className="h-4 w-4 text-emerald-500" />
                <span>Médias calculadas</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Histórico completo</span>
              </div>
            </div>
            
            <PremiumGate softBlock>
              {/* Irá mostrar apenas o botão de upgrade para usuários free */}
            </PremiumGate>
          </div>
        </div>
      </div>
    </div>
  );
}
