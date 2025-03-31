'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

type HeatmapData = {
  date: string
  count: number
}

type ActivityHeatmapProps = {
  data: HeatmapData[]
  maxCount?: number
  className?: string
}

export function ActivityHeatmap({ data, maxCount: propMaxCount, className }: ActivityHeatmapProps) {
  const [maxCount, setMaxCount] = useState(propMaxCount || 0)
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({})
  const [weeks, setWeeks] = useState<Date[][]>([])
  const [months, setMonths] = useState<{name: string, index: number, width: number}[]>([])
  
  // Dias da semana abreviados em português
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  
  // Nomes dos meses em português
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]

  useEffect(() => {
    // Processar os dados para o formato do mapa de calor
    const dataMap: Record<string, number> = {}
    let max = propMaxCount || 0
    
    data.forEach(item => {
      dataMap[item.date] = item.count
      if (item.count > max) max = item.count
    })
    
    setHeatmapData(dataMap)
    setMaxCount(max)
    
    // Gerar as semanas para o mapa de calor (último ano)
    const today = new Date()
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(today.getFullYear() - 1)
    oneYearAgo.setDate(oneYearAgo.getDate() + 1) // Começar do dia seguinte ao de um ano atrás
    
    const weeksArray: Date[][] = []
    const monthsArray: {name: string, index: number, width: number}[] = []
    
    // Inicializar a primeira semana
    let currentWeek: Date[] = []
    let currentDate = new Date(oneYearAgo)
    
    // Rastrear os meses para os rótulos
    let currentMonth = -1
    let weekIndex = 0
    let monthStartIndex = 0
    
    // Gerar todas as datas para o mapa de calor
    while (currentDate <= today) {
      // Verificar se é um novo mês para adicionar ao array de meses
      if (currentDate.getMonth() !== currentMonth) {
        // Se não é o primeiro mês, finalizar o anterior
        if (currentMonth !== -1) {
          monthsArray[monthsArray.length - 1].width = weekIndex - monthStartIndex
        }
        
        currentMonth = currentDate.getMonth()
        monthStartIndex = weekIndex
        
        monthsArray.push({
          name: monthNames[currentMonth],
          index: weekIndex,
          width: 0 // Será atualizado depois
        })
      }
      
      // Adicionar o dia à semana atual
      currentWeek.push(new Date(currentDate))
      
      // Se for sábado ou o último dia, finalizar a semana
      if (currentDate.getDay() === 6 || currentDate.getTime() === today.getTime()) {
        weeksArray.push(currentWeek)
        currentWeek = []
        weekIndex++
      }
      
      // Avançar para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Atualizar a largura do último mês
    if (monthsArray.length > 0) {
      monthsArray[monthsArray.length - 1].width = weekIndex - monthStartIndex
    }
    
    // Se a última semana não estiver completa, adicionar
    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek)
    }
    
    setWeeks(weeksArray)
    setMonths(monthsArray)
  }, [data, propMaxCount])
  
  // Função para determinar a cor com base na contagem
  const getColor = (count: number) => {
    if (count === 0) return 'border border-zinc-200 dark:border-zinc-700 bg-transparent'
    
    const intensity = Math.min(1, count / (maxCount || 1))
    
    if (intensity < 0.25) {
      return 'bg-emerald-100 dark:bg-emerald-900/30'
    } else if (intensity < 0.5) {
      return 'bg-emerald-200 dark:bg-emerald-800/40'
    } else if (intensity < 0.75) {
      return 'bg-emerald-300 dark:bg-emerald-700/60'
    } else {
      return 'bg-emerald-400 dark:bg-emerald-600/80'
    }
  }
  
  // Formatar data para exibição
  const formatDate = (date: Date) => {
    return `${date.getDate()} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`
  }
  
  return (
    <div className={cn('flex flex-col', className)}>
      {/* Rótulos dos meses */}
      <div className="flex ml-8 mb-1 relative h-5">
        {months.map((month, i) => (
          <div 
            key={`month-${i}`}
            className="text-xs text-muted-foreground absolute text-center"
            style={{ 
              left: `${month.index * 20}px`,
              width: `${month.width * 20}px` // Ajustar largura com base na largura do mês
            }}
          >
            {month.name}
          </div>
        ))}
      </div>
      
      <div className="flex">
        {/* Rótulos dos dias da semana */}
        <div className="flex flex-col mr-2">
          {weekdays.map((day, i) => (
            <div 
              key={`day-${i}`} 
              className="text-[10px] text-muted-foreground flex items-center justify-end"
              style={{ 
                height: '20px',
                marginBottom: '4px'
              }}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Grid do mapa de calor */}
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="flex flex-col">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const day = week[dayIndex]
                const dateStr = day ? day.toISOString().split('T')[0] : ''
                const count = day ? (heatmapData[dateStr] || 0) : 0
                
                return (
                  <div 
                    key={`day-${weekIndex}-${dayIndex}`}
                    className={cn(
                      'w-4 h-4 rounded-sm cursor-pointer transition-colors mb-2',
                      day ? getColor(count) : 'opacity-0'
                    )}
                    title={day ? `${formatDate(day)}: ${count} atividades` : ''}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legenda */}
      <div className="flex items-center justify-end mt-1 text-xs text-muted-foreground">
        <div className="flex items-center">
          <span className="mr-1">Menos</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-sm border border-zinc-200 dark:border-zinc-700 bg-transparent" />
            <div className="w-4 h-4 rounded-sm bg-emerald-100 dark:bg-emerald-900/30" />
            <div className="w-4 h-4 rounded-sm bg-emerald-200 dark:bg-emerald-800/40" />
            <div className="w-4 h-4 rounded-sm bg-emerald-300 dark:bg-emerald-700/60" />
            <div className="w-4 h-4 rounded-sm bg-emerald-400 dark:bg-emerald-600/80" />
          </div>
          <span className="ml-1">Mais</span>
        </div>
      </div>
    </div>
  )
}
