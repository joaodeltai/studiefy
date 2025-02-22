"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useSubjects } from "./useSubjects"

export type DateFilter = "7days" | "30days"

export interface StudyHoursData {
  subject_id: string
  subject_name: string
  subject_color: string
  seconds: number
}

export function formatStudyTime(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours === 0) {
    return `${minutes}min`
  }
  
  return `${hours}h${minutes > 0 ? `${minutes}min` : ''}`
}

export function useStudyHours(dateFilter: DateFilter = "7days") {
  const [data, setData] = useState<StudyHoursData[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { subjects } = useSubjects()

  useEffect(() => {
    async function loadStudyHours() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Calcular data inicial baseada no filtro
        const startDate = new Date()
        if (dateFilter === "7days") {
          startDate.setDate(startDate.getDate() - 7)
        } else {
          startDate.setDate(startDate.getDate() - 30)
        }

        // Buscar todos os conteúdos com focus_time
        const { data: contents, error: contentsError } = await supabase
          .from("contents")
          .select(`
            id,
            focus_time,
            updated_at,
            subject:subjects (
              id,
              name,
              color,
              user_id
            )
          `)
          .eq("deleted", false)
          .gt("focus_time", 0)
          .gte("updated_at", startDate.toISOString())

        if (contentsError) throw contentsError

        // Agrupar segundos por matéria
        const studyHours = contents
          ?.filter(content => content.subject?.user_id === user.id)
          .reduce((acc, content) => {
            const subjectId = content.subject?.id
            if (!subjectId) return acc

            const existingSubject = acc.find(s => s.subject_id === subjectId)
            const seconds = content.focus_time || 0

            if (existingSubject) {
              existingSubject.seconds += seconds
            } else {
              acc.push({
                subject_id: subjectId,
                subject_name: content.subject.name,
                subject_color: content.subject.color,
                seconds: seconds
              })
            }

            return acc
          }, [] as StudyHoursData[])

        // Ordenar por segundos em ordem decrescente
        studyHours.sort((a, b) => b.seconds - a.seconds)

        setData(studyHours || [])
      } catch (error) {
        console.error("Error loading study hours:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStudyHours()
  }, [user, subjects, dateFilter])

  return { data, loading }
}
