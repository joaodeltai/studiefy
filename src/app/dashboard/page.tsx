"use client"

import { useProfile } from "@/hooks/useProfile"
import { useStreak } from "@/hooks/useStreak"
import { useStats } from "@/hooks/useStats"
import { Progress } from "@/components/ui/progress"
import { Loader2, Medal, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { StudyHoursChart } from "@/components/study-hours-chart"
import { SubscriptionStatus } from "@/components/subscription-status"
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
      <div className="w-full max-w-3xl mx-auto space-y-4">
        {/* Status da assinatura */}
        <SubscriptionStatus />
        
        {/* Linha superior com nível e ofensiva - visível apenas em desktop */}
        <div className={`hidden md:flex flex-col space-y-2 ${needsPadding ? 'pl-8' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Medal className="h-6 w-6 text-yellow-500" />
              <span className="text-lg font-semibold">
                Nível {profile.level}
              </span>
              <span className="text-sm text-studiefy-black/60">
                ({profile.xp}/{xpForNextLevel} XP)
              </span>
            </div>
            <div 
              className={cn(
                "flex items-center gap-2 px-4 py-1 rounded-full",
                streak.streak > 0 
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" 
                  : "bg-zinc-100 text-zinc-600"
              )}
            >
              <Flame className={cn(
                "h-5 w-5",
                streak.streak > 0 ? "text-white" : ""
              )} />
              <span className="font-medium">
                {streak.streak} {streak.streak === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="w-full">
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Card de estatísticas */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full">
          <div className="grid grid-cols-3 divide-x">
            <div className="px-3 py-4 sm:px-6 sm:py-6 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-4xl font-bold tracking-tight">
                {totalContents}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1">
                conteúdos
              </span>
            </div>

            <div className="px-3 py-4 sm:px-6 sm:py-6 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-4xl font-bold tracking-tight">
                {contentsInProgress}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1">
                em progresso
              </span>
            </div>

            <div className="px-3 py-4 sm:px-6 sm:py-6 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-4xl font-bold tracking-tight">
                {completedContents}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-1">
                finalizados
              </span>
            </div>
          </div>
        </div>

        {/* Gráfico de horas estudadas */}
        <StudyHoursChart />
      </div>
    </div>
  )
}
