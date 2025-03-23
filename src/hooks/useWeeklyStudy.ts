"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"

export interface WeeklyStudyData {
  day: string
  dayName: string
  minutes: number
  date: string
}

// Função para obter abreviação do dia da semana
const getDayAbbreviation = (dayIndex: number) => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return days[dayIndex]
}

// Função para formatar data no formato DD/MM
const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${day}/${month}`
}

export function useWeeklyStudy(startDate: Date, endDate: Date) {
  const [data, setData] = useState<WeeklyStudyData[]>([])
  const [loading, setLoading] = useState(true)
  const [trend, setTrend] = useState<{percentage: number, isUp: boolean}>({percentage: 0, isUp: true})
  const { user } = useAuth()

  useEffect(() => {
    async function loadWeeklyStudy() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Inicializar array com todos os dias da semana
        const weekData: WeeklyStudyData[] = []
        const currentDate = new Date(startDate)
        
        for (let i = 0; i < 7; i++) {
          const day = new Date(currentDate)
          day.setDate(currentDate.getDate() + i)
          
          weekData.push({
            day: formatDate(day),
            dayName: getDayAbbreviation(day.getDay()),
            minutes: 0,
            date: day.toISOString()
          })
        }

        // Buscar todos os conteúdos com focus_time atualizados no período
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
          .lte("updated_at", endDate.toISOString())

        if (contentsError) throw contentsError

        // Filtrar conteúdos do usuário atual
        const userContents = (contents || []).filter((content: any) => {
          return content.subject && typeof content.subject === 'object' && 
                 !Array.isArray(content.subject) && content.subject.user_id === user.id
        })

        // Agrupar minutos por dia
        userContents.forEach((content: any) => {
          if (!content.updated_at || typeof content.focus_time !== 'number') return
          
          const updatedAt = new Date(content.updated_at)
          const dayIndex = weekData.findIndex(day => {
            const dayDate = new Date(day.date)
            return dayDate.getDate() === updatedAt.getDate() && 
                   dayDate.getMonth() === updatedAt.getMonth() && 
                   dayDate.getFullYear() === updatedAt.getFullYear()
          })

          if (dayIndex !== -1) {
            // Converter segundos para minutos
            weekData[dayIndex].minutes += Math.floor(content.focus_time / 60)
          }
        })

        setData(weekData)

        // Calcular tendência comparando com a semana anterior
        const previousStartDate = new Date(startDate)
        previousStartDate.setDate(previousStartDate.getDate() - 7)
        const previousEndDate = new Date(endDate)
        previousEndDate.setDate(previousEndDate.getDate() - 7)

        const { data: previousContents, error: previousError } = await supabase
          .from("contents")
          .select(`
            id,
            focus_time,
            updated_at,
            subject:subjects (
              id,
              user_id
            )
          `)
          .eq("deleted", false)
          .gt("focus_time", 0)
          .gte("updated_at", previousStartDate.toISOString())
          .lte("updated_at", previousEndDate.toISOString())

        if (previousError) throw previousError

        // Calcular total de minutos da semana atual
        const currentTotal = weekData.reduce((sum, item) => sum + item.minutes, 0)

        // Calcular total de minutos da semana anterior
        const previousUserContents = (previousContents || []).filter((content: any) => {
          return content.subject && typeof content.subject === 'object' && 
                 !Array.isArray(content.subject) && content.subject.user_id === user.id
        })
        
        const previousTotal = previousUserContents.reduce((sum, content: any) => {
          return sum + (typeof content.focus_time === 'number' ? Math.floor(content.focus_time / 60) : 0)
        }, 0)

        // Calcular diferença percentual
        if (previousTotal > 0) {
          const percentageDiff = ((currentTotal - previousTotal) / previousTotal) * 100
          setTrend({
            percentage: Math.abs(parseFloat(percentageDiff.toFixed(1))),
            isUp: percentageDiff > 0
          })
        } else if (currentTotal > 0) {
          // Se semana anterior for zero e atual for maior que zero, é 100% de aumento
          setTrend({
            percentage: 100,
            isUp: true
          })
        } else {
          // Se ambos forem zero, não há tendência
          setTrend({
            percentage: 0,
            isUp: true
          })
        }

      } catch (error) {
        console.error("Erro ao carregar dados de estudo semanal:", error)
      } finally {
        setLoading(false)
      }
    }

    loadWeeklyStudy()
  }, [user, startDate, endDate])

  return { data, loading, trend }
}
