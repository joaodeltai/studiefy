"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { differenceInDays } from "date-fns"

interface Stats {
  totalContents: number
  studiedContents: number
  daysInPlatform: number
  loading: boolean
}

interface Content {
  id: string
  completed: boolean
  subject?: {
    user_id: string
  }
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    totalContents: 0,
    studiedContents: 0,
    daysInPlatform: 0,
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
        const studiedContents = userContents.filter(c => c.completed).length

        // Buscar data de criação do usuário
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("user_id", user.id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          throw profileError
        }

        // Calcular dias na plataforma
        const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date()
        const daysInPlatform = Math.max(0, differenceInDays(new Date(), createdAt))

        setStats({
          totalContents,
          studiedContents,
          daysInPlatform,
          loading: false,
        })
      } catch (error: any) {
        console.error("Error loading stats:", error.message || error)
        // Em caso de erro, mantém os valores zerados mas marca como não carregando
        setStats({
          totalContents: 0,
          studiedContents: 0,
          daysInPlatform: 0,
          loading: false,
        })
      }
    }

    loadStats()
  }, [user])

  return stats
}
