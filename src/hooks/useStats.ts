"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { differenceInDays } from "date-fns"

interface Stats {
  totalContents: number
  contentsInProgress: number
  completedContents: number
  loading: boolean
}

interface Content {
  id: string
  completed: boolean
  focus_time?: number
  subject?: {
    user_id: string
  }
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    totalContents: 0,
    contentsInProgress: 0,
    completedContents: 0,
    loading: true,
  })
  const { user } = useAuth()

  useEffect(() => {
    async function loadStats() {
      if (!user) {
        setStats(prev => ({ ...prev, loading: false }))
        return
      }

      try {
        // Buscar conteúdos e suas matérias
        const { data: contents, error: contentsError } = await supabase
          .from("contents")
          .select(`
            id,
            completed,
            focus_time,
            subject:subjects (
              user_id
            )
          `)
          .eq("deleted", false) as { data: Content[] | null, error: any }

        if (contentsError) {
          console.error("Error fetching contents:", contentsError)
          throw contentsError
        }

        // Filtrar apenas conteúdos das matérias do usuário
        const userContents = contents?.filter(
          content => content.subject?.user_id === user.id
        ) || []

        const totalContents = userContents.length
        const completedContents = userContents.filter(c => c.completed).length
        const contentsInProgress = userContents.filter(c => !c.completed && (c.focus_time || 0) > 0).length

        setStats({
          totalContents,
          contentsInProgress,
          completedContents,
          loading: false,
        })
      } catch (error: any) {
        console.error("Error loading stats:", error.message || error)
        // Em caso de erro, mantém os valores zerados mas marca como não carregando
        setStats({
          totalContents: 0,
          contentsInProgress: 0,
          completedContents: 0,
          loading: false,
        })
      }
    }

    loadStats()
  }, [user])

  return stats
}
