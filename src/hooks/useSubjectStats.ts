"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useAuth } from "./useAuth"
import { toast } from "sonner"

interface SubjectStats {
  totalContents: number
  completedContents: number
  progress: number
}

export function useSubjectStats(subjectId: string) {
  const [stats, setStats] = useState<SubjectStats>({
    totalContents: 0,
    completedContents: 0,
    progress: 0,
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchStats() {
      if (!user || !subjectId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Get all non-deleted contents for the subject
        const { data: contents, error: contentsError } = await supabase
          .from('contents')
          .select('id')
          .eq('subject_id', subjectId)
          .eq('deleted', false)

        if (contentsError) {
          console.error("Error fetching contents:", contentsError)
          toast.error("Erro ao carregar estatísticas")
          return
        }

        if (!contents?.length) {
          setStats({
            totalContents: 0,
            completedContents: 0,
            progress: 0,
          })
          return
        }

        // Get completed contents
        const { data: completions, error: completionsError } = await supabase
          .from('contents')
          .select('id')
          .eq('subject_id', subjectId)
          .eq('deleted', false)
          .eq('completed', true)

        if (completionsError) {
          console.error("Error fetching completions:", completionsError)
          toast.error("Erro ao carregar estatísticas")
          return
        }

        const totalContents = contents.length
        const completedContents = completions?.length || 0

        setStats({
          totalContents,
          completedContents,
          progress: totalContents > 0 ? (completedContents / totalContents) * 100 : 0,
        })
      } catch (error) {
        console.error("Error fetching subject stats:", error)
        toast.error("Erro ao carregar estatísticas")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [subjectId, user])

  return { stats, loading }
}
