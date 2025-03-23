"use client"

import { useProfile } from "@/hooks/useProfile"
import { useStreak } from "@/hooks/useStreak"
import { useStats } from "@/hooks/useStats"
import { useSetPageTitle } from "@/hooks/useSetPageTitle"
import { Progress } from "@/components/ui/progress"
import { Loader2, Medal, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { StudyHoursChart } from "@/components/study-hours-chart"
import { SubscriptionStatus } from "@/components/subscription-status"
import { DailyQuote } from "@/components/daily-quote"
import { WeeklyStudyChart } from "@/components/weekly-study-chart"
import { useState, useEffect } from 'react'

// Funções para cálculo de XP
const getXPForLevel = (level: number) => level * 10
const getTotalXPForLevel = (level: number) => {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i)
  }
  return total
}

export default function DashboardPage() {
  const { profile, loading: loadingProfile } = useProfile()
  const { streak, loading: loadingStreak } = useStreak()
  const { totalContents, contentsInProgress, completedContents, loading: loadingStats } = useStats()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [needsPadding, setNeedsPadding] = useState(false)
  
  // Define o título da página
  // useSetPageTitle('Dashboard') - Removido para mostrar nível, XP e ofensiva no header

  // Efeito para recuperar o estado da sidebar e verificar se precisa de padding
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar_state')
    if (savedState) {
      setIsCollapsed(savedState === 'collapsed')
    }
    
    // Função para verificar se o cabeçalho precisa de padding
    const checkNeedsPadding = () => {
      // Em telas menores que 1200px, geralmente o botão fica próximo ao cabeçalho
      const screenWidth = window.innerWidth
      setNeedsPadding(screenWidth > 768 && screenWidth < 1200)
    }
    
    // Verificar inicialmente
    checkNeedsPadding()
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkNeedsPadding)
    
    return () => {
      window.removeEventListener('resize', checkNeedsPadding)
    }
  }, [])

  if (loadingProfile || loadingStreak || loadingStats) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  if (!profile || !streak) {
    return null
  }

  // Calcular XP necessário para o próximo nível
  const xpForNextLevel = profile.level < 50 ? getXPForLevel(profile.level) : getXPForLevel(50)
  const progress = (profile.xp / xpForNextLevel) * 100

  return (
    <div className="h-full p-4 space-y-4 overflow-y-auto overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto space-y-4">
        {/* Status da assinatura */}
        <SubscriptionStatus />
        
        {/* Layout em grid - Cards lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Gráfico de horas estudadas - Lado esquerdo, altura completa */}
          <div className="md:col-span-7 row-span-2">
            <div className="h-full">
              <StudyHoursChart />
            </div>
          </div>

          {/* Área direita dividida em duas partes, com estatísticas e frases lado a lado */}
          <div className="md:col-span-5 md:row-span-1 md:h-1/2">
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Card de estatísticas */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full h-full">
                <div className="flex flex-col divide-y h-full overflow-auto">
                  {/* Conteúdos */}
                  <div className="px-3 py-2 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{totalContents}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Conteúdos</span>
                      <p className="text-xs text-muted-foreground">Total disponível</p>
                    </div>
                  </div>

                  {/* Em progresso */}
                  <div className="px-3 py-2 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-amber-500">{contentsInProgress}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Em progresso</span>
                      <p className="text-xs text-muted-foreground">Conteúdos iniciados</p>
                    </div>
                  </div>

                  {/* Finalizados */}
                  <div className="px-3 py-2 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-green-500">{completedContents}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Finalizados</span>
                      <p className="text-xs text-muted-foreground">Conteúdos concluídos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frase motivacional do dia */}
              <div className="h-full">
                <DailyQuote />
              </div>
            </div>
          </div>

          {/* Gráfico de estudo semanal - Abaixo das estatísticas e frases */}
          <div className="md:col-span-5 md:row-span-1 md:h-1/2">
            <WeeklyStudyChart />
          </div>
        </div>
      </div>
    </div>
  )
}
