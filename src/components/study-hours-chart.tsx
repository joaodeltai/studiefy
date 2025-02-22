"use client"

import { useState } from "react"
import { TrendingUp } from "lucide-react"
import { PolarGrid, RadialBar, RadialBarChart, LabelList } from "recharts"
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
import { useStudyHours, formatStudyTime, DateFilter } from "@/hooks/useStudyHours"
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const dateFilterOptions = {
  "7days": "7 dias",
  "30days": "30 dias"
} as const

const dateFilterDescriptions = {
  "7days": "Últimos 7 dias",
  "30days": "Últimos 30 dias"
} as const

// Função para formatar o tempo sem segundos
const formatTimeWithoutSeconds = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours === 0) {
    return `${minutes}min`
  }
  
  if (minutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h${minutes}min`
}

export function StudyHoursChart() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("7days")
  const { data, loading } = useStudyHours(dateFilter)

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  // Criar config dinâmico baseado nas matérias
  const chartConfig = data.reduce((config, item) => {
    config[item.subject_id] = {
      label: item.subject_name,
      color: item.subject_color,
    }
    return config
  }, {
    hours: {
      label: "Tempo",
    }
  } as ChartConfig)

  // Formatar dados para o gráfico
  const chartData = data.map(item => ({
    name: item.subject_name,
    subject: item.subject_name,
    seconds: item.seconds,
    fill: item.subject_color,
  }))

  // Calcular total de segundos
  const totalSeconds = data.reduce((total, item) => total + item.seconds, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-2">
        <div className="w-full flex items-center justify-between gap-4">
          <CardTitle>Tempo Estudado</CardTitle>
          <Select
            value={dateFilter}
            onValueChange={(value) => setDateFilter(value as DateFilter)}
          >
            <SelectTrigger className="h-8 w-[90px] text-sm whitespace-nowrap">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(dateFilterOptions).map(([value, label]) => (
                <SelectItem key={value} value={value} className="text-sm">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CardDescription className="text-xs">
          {dateFilterDescriptions[dateFilter]}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart 
            data={chartData} 
            innerRadius={30} 
            outerRadius={110}
            startAngle={-90}
            endAngle={380}
          >
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <div className="font-medium">{data.subject}</div>
                      <div className="text-muted-foreground">
                        {formatTimeWithoutSeconds(data.seconds)}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <PolarGrid gridType="circle" />
            <RadialBar 
              dataKey="seconds" 
              background
              className="[&_.recharts-radial-bar-background-sector]:fill-muted/20"
            >
              <LabelList
                dataKey="name"
                position="insideStart"
                fill="white"
                className="capitalize mix-blend-luminosity"
                fontSize={11}
                offset={10}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total de {formatTimeWithoutSeconds(totalSeconds)} estudados
        </div>
        <div className="leading-none text-muted-foreground text-xs">
          Mostrando tempo total estudado por matéria
        </div>
      </CardFooter>
    </Card>
  )
}
