"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"
import { startOfDay, isYesterday, isToday } from "date-fns"

export interface Streak {
  streak: number
  last_study_date: string | null
}

export function useStreak() {
  const [streak, setStreak] = useState<Streak | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchStreak()
    }
  }, [user])

  const fetchStreak = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("streak, last_study_date")
        .eq("user_id", user?.id)
        .single()

      if (error) throw error
      setStreak(data)
    } catch (error) {
      console.error("Error fetching streak:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStreak = async (focusTime?: number) => {
    if (!streak) return
    // Garantir que apenas Pomodoros de pelo menos 30 minutos (1800 segundos) contem
    if (focusTime === undefined || focusTime < 1800) return

    try {
      const now = new Date() // Data atual completa
      const today = startOfDay(now) // Início do dia atual para comparação
      const lastStudyDate = streak.last_study_date 
        ? startOfDay(new Date(streak.last_study_date)) // Início do último dia de estudo para comparação
        : null
      
      let newStreak = streak.streak
      
      // Se é a primeira vez estudando
      if (!lastStudyDate) {
        newStreak = 0 // Inicia em 0
      } else {
        // Calcula a diferença em dias entre a última data de estudo e hoje
        const diffInDays = Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Se estudou hoje, mantém a ofensiva
        if (diffInDays === 0) {
          // Não faz nada, mantém o valor atual de newStreak
        }
        // Se estudou ontem, incrementa a ofensiva
        else if (diffInDays === 1) {
          newStreak += 1
        }
        // Se passou mais de um dia sem estudar, zera a ofensiva
        else {
          newStreak = 0 // Zera para 0
        }
      }

      // Salva a data atual completa (com hora) no banco
      const { error } = await supabase
        .from("profiles")
        .update({
          streak: newStreak,
          last_study_date: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq("user_id", user?.id)

      if (error) throw error

      // Atualiza o estado local com a data atual completa
      setStreak(prev => prev ? {
        ...prev,
        streak: newStreak,
        last_study_date: now.toISOString()
      } : null)

      return { streak: newStreak, last_study_date: now.toISOString() }
    } catch (error) {
      console.error("Error updating streak:", error)
      throw error
    }
  }

  return {
    streak,
    loading,
    updateStreak
  }
}
