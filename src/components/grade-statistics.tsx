"use client"

import { useMemo } from "react"
import { EventWithSubject } from "@/hooks/useAllEvents"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { parseISO } from "date-fns"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface GradeStatisticsProps {
  events: EventWithSubject[]
  subjectId?: string
}

export function GradeStatistics({ events, subjectId }: GradeStatisticsProps) {
  // Filtrar eventos por matéria se necessário
  const filteredEvents = useMemo(() => {
    if (subjectId && subjectId !== "all") {
      return events.filter(event => event.subject_id === subjectId)
    }
    return events
  }, [events, subjectId])
  
  // Calcular estatísticas
  const statistics = useMemo(() => {
    // Eventos com notas regulares
    const eventsWithGrades = filteredEvents.filter(
      event => event.grade !== null && event.grade !== undefined
    )
    
    // Eventos com notas de redação
    const eventsWithEssayGrades = filteredEvents.filter(
      event => event.essay_grade !== null && event.essay_grade !== undefined
    )
    
    // Calcular média das notas regulares
    const averageGrade = eventsWithGrades.length > 0
      ? eventsWithGrades.reduce((sum, event) => sum + (event.grade || 0), 0) / eventsWithGrades.length
      : 0
    
    // Calcular média das notas de redação
    const averageEssayGrade = eventsWithEssayGrades.length > 0
      ? eventsWithEssayGrades.reduce((sum, event) => sum + (event.essay_grade || 0), 0) / eventsWithEssayGrades.length
      : 0
    
    // Encontrar a nota mais alta
    const highestGrade = eventsWithGrades.length > 0
      ? Math.max(...eventsWithGrades.map(event => event.grade || 0))
      : 0
    
    // Encontrar a nota mais baixa
    const lowestGrade = eventsWithGrades.length > 0
      ? Math.min(...eventsWithGrades.map(event => event.grade || 0))
      : 0
    
    // Calcular a tendência de evolução/retrocesso das notas regulares
    let gradeProgressPercentage = 0
    let gradeProgressTrend: 'up' | 'down' | 'neutral' = 'neutral'
    
    if (eventsWithGrades.length >= 2) {
      // Ordenar eventos por data (mais antigos primeiro)
      const sortedEvents = [...eventsWithGrades].sort((a, b) => {
        const dateA = parseISO(a.date)
        const dateB = parseISO(b.date)
        return dateA.getTime() - dateB.getTime()
      })
      
      // Pegar a primeira e a última nota para comparação
      const firstGrade = sortedEvents[0].grade || 0
      const lastGrade = sortedEvents[sortedEvents.length - 1].grade || 0
      
      // Calcular a diferença percentual
      if (firstGrade > 0) {
        gradeProgressPercentage = ((lastGrade - firstGrade) / firstGrade) * 100
        gradeProgressTrend = gradeProgressPercentage > 0 ? 'up' : (gradeProgressPercentage < 0 ? 'down' : 'neutral')
      }
    }
    
    // Calcular a tendência de evolução/retrocesso das notas de redação
    let essayProgressPercentage = 0
    let essayProgressTrend: 'up' | 'down' | 'neutral' = 'neutral'
    
    if (eventsWithEssayGrades.length >= 2) {
      // Ordenar eventos por data (mais antigos primeiro)
      const sortedEvents = [...eventsWithEssayGrades].sort((a, b) => {
        const dateA = parseISO(a.date)
        const dateB = parseISO(b.date)
        return dateA.getTime() - dateB.getTime()
      })
      
      // Pegar a primeira e a última nota para comparação
      const firstGrade = sortedEvents[0].essay_grade || 0
      const lastGrade = sortedEvents[sortedEvents.length - 1].essay_grade || 0
      
      // Calcular a diferença percentual
      if (firstGrade > 0) {
        essayProgressPercentage = ((lastGrade - firstGrade) / firstGrade) * 100
        essayProgressTrend = essayProgressPercentage > 0 ? 'up' : (essayProgressPercentage < 0 ? 'down' : 'neutral')
      }
    }
    
    return {
      totalEvents: filteredEvents.length,
      eventsWithGrades: eventsWithGrades.length,
      eventsWithEssayGrades: eventsWithEssayGrades.length,
      averageGrade,
      averageEssayGrade,
      highestGrade,
      lowestGrade,
      gradeProgressPercentage,
      gradeProgressTrend,
      essayProgressPercentage,
      essayProgressTrend
    }
  }, [filteredEvents])
  
  // Formatar número para exibição
  const formatNumber = (num: number) => {
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  
  // Formatar porcentagem para exibição
  const formatPercentage = (num: number) => {
    return Math.abs(num).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Média Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.eventsWithGrades > 0 ? formatNumber(statistics.averageGrade) : "—"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.eventsWithGrades} evento{statistics.eventsWithGrades !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Média de Redação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.eventsWithEssayGrades > 0 ? formatNumber(statistics.averageEssayGrade) : "—"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.eventsWithEssayGrades} evento{statistics.eventsWithEssayGrades !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Evolução de Notas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-2xl font-bold mr-2">
              {statistics.eventsWithGrades >= 2 
                ? formatPercentage(statistics.gradeProgressPercentage) 
                : "—"}
            </div>
            {statistics.gradeProgressTrend === 'up' ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : statistics.gradeProgressTrend === 'down' ? (
              <TrendingDown className="h-5 w-5 text-red-500" />
            ) : (
              <Minus className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.eventsWithGrades >= 2 
              ? "Comparando primeira e última nota" 
              : "Necessário pelo menos 2 eventos"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Evolução de Redação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-2xl font-bold mr-2">
              {statistics.eventsWithEssayGrades >= 2 
                ? formatPercentage(statistics.essayProgressPercentage) 
                : "—"}
            </div>
            {statistics.essayProgressTrend === 'up' ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : statistics.essayProgressTrend === 'down' ? (
              <TrendingDown className="h-5 w-5 text-red-500" />
            ) : (
              <Minus className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.eventsWithEssayGrades >= 2 
              ? "Comparando primeira e última nota" 
              : "Necessário pelo menos 2 eventos"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Nota Mais Alta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.eventsWithGrades > 0 ? formatNumber(statistics.highestGrade) : "—"}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
