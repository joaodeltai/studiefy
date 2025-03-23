"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { useWeeklyStudy } from "@/hooks/useWeeklyStudy"

// Função para formatar minutos para horas e minutos
const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}min`
  }
  
  if (mins === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${mins}min`
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

type WeeklyStudyData = {
  day: string
  dayName: string
  minutes: number
  date: string
}

export function WeeklyStudyChart() {
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Se hoje for domingo, começa na segunda anterior
    const startDate = new Date(today)
    startDate.setDate(diff)
    startDate.setHours(0, 0, 0, 0)
    return startDate
  })
  
  const [weekEnd, setWeekEnd] = useState<Date>(() => {
    const endDate = new Date(weekStart)
    endDate.setDate(weekStart.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
    return endDate
  })
  
  useEffect(() => {
    // Atualiza a data de fim ao mudar a data de início
    const endDate = new Date(weekStart)
    endDate.setDate(weekStart.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
    setWeekEnd(endDate)
  }, [weekStart])
  
  const { data: studyData, loading: isLoading, trend } = useWeeklyStudy(weekStart, weekEnd)
  
  const goToPreviousWeek = () => {
    const newStart = new Date(weekStart)
    newStart.setDate(weekStart.getDate() - 7)
    setWeekStart(newStart)
  }
  
  const goToNextWeek = () => {
    const newStart = new Date(weekStart)
    newStart.setDate(weekStart.getDate() + 7)
    setWeekStart(newStart)
  }
  
  // Verifique se a próxima semana não ultrapassaria a data atual
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const canGoForward = weekStart < today
  
  const chartConfig = {
    minutes: {
      label: "Tempo estudado",
      color: "hsl(var(--chart-1))",
    },
  } as ChartConfig
  
  const totalMinutes = studyData.reduce((total, day) => total + day.minutes, 0)
  
  return (
    <Card className="w-full">
      <CardHeader className="items-center pb-2">
        <div className="w-full flex items-center justify-between">
          <CardTitle>Estudo semanal</CardTitle>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={goToPreviousWeek}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm px-2">
              {formatDate(weekStart)} - {formatDate(weekEnd)}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={goToNextWeek}
              disabled={!canGoForward}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs">
          Análise diária de tempo estudado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-44">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="dayName"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                  content={(props) => {
                    if (props.active && props.payload && props.payload.length) {
                      const data = props.payload[0].payload as typeof studyData[0]
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="font-medium">{data.dayName} ({data.day})</div>
                          <div className="text-muted-foreground">
                            {formatMinutes(data.minutes)}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="minutes" 
                  fill="var(--color-minutes)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {trend.isUp ? (
            <>
              Aumento de {trend.percentage}% em relação à semana anterior
              <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : (
            <>
              Redução de {trend.percentage}% em relação à semana anterior
              <TrendingDown className="h-4 w-4 text-red-500" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Total de {formatMinutes(totalMinutes)} estudados nesta semana
        </div>
      </CardFooter>
    </Card>
  )
}
