"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { format, parseISO, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"

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

interface GradesChartProps {
  events: any[]
  subjectId?: string
}

export function GradesChart({ events, subjectId }: GradesChartProps) {
  // Filtrar eventos que têm notas
  const eventsWithGrades = events.filter(event => 
    (typeof event.grade === 'number' && !isNaN(event.grade)) || 
    (typeof event.essay_grade === 'number' && !isNaN(event.essay_grade))
  );

  // Ordenar eventos por data (mais antigo primeiro para o gráfico)
  const sortedEvents = [...eventsWithGrades].sort((a, b) => {
    const dateA = parseISO(a.date)
    const dateB = parseISO(b.date)
    if (isValid(dateA) && isValid(dateB)) {
      return dateA.getTime() - dateB.getTime()
    }
    return 0
  })

  // Preparar dados para o gráfico
  const chartData = sortedEvents.map(event => {
    const date = parseISO(event.date)
    const formattedDate = isValid(date) ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Data inválida"
    
    return {
      date: formattedDate,
      nota: typeof event.grade === 'number' ? event.grade : null,
      redacao: typeof event.essay_grade === 'number' ? event.essay_grade : null,
      id: event.id,
      title: event.title || "Evento sem título",
    }
  })

  // Configuração do gráfico
  const chartConfig = {
    nota: {
      label: "Nota",
      color: "hsl(var(--chart-1))",
    },
    redacao: {
      label: "Redação",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  // Calcular a tendência
  const calculateTrend = () => {
    // Filtrar apenas eventos com notas válidas
    const validGrades = chartData.filter(item => item.nota !== null && !isNaN(item.nota))
    
    if (validGrades.length < 2) return { percentage: 0, trending: "neutral" }
    
    const firstValue = validGrades[0].nota
    const lastValue = validGrades[validGrades.length - 1].nota
    
    if (firstValue === 0 || firstValue === null) return { percentage: 0, trending: "neutral" }
    
    const percentage = ((lastValue - firstValue) / firstValue) * 100
    const trending = percentage > 0 ? "up" : percentage < 0 ? "down" : "neutral"
    
    return { percentage: Math.abs(percentage).toFixed(1), trending }
  }

  const trend = calculateTrend()

  // Período do gráfico
  const getPeriodText = () => {
    if (chartData.length < 2) return "Período insuficiente para análise"
    
    const firstDate = chartData[0].date
    const lastDate = chartData[chartData.length - 1].date
    
    return `${firstDate} - ${lastDate}`
  }

  // Verificar se há dados suficientes para o gráfico
  const hasEnoughData = chartData.length >= 2

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Evolução de Notas</CardTitle>
        <CardDescription>
          {subjectId 
            ? "Mostrando evolução de notas para a matéria selecionada" 
            : "Mostrando evolução de notas para todas as matérias"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasEnoughData ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    tickCount={6} 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent 
                        indicator="dot"
                        formatter={(value, name, props) => {
                          if (value === null || isNaN(Number(value))) return ["-", name === "nota" ? "Nota" : "Redação"]
                          return [value, name === "nota" ? "Nota" : "Redação"]
                        }}
                        labelFormatter={(label, props) => {
                          // Verificar se props e props.payload existem e não estão vazios
                          if (!props || !props.payload || props.payload.length === 0) {
                            return label;
                          }
                          
                          const dataIndex = props.payload[0]?.payload?.id;
                          // Verificar se dataIndex existe antes de procurar o evento
                          if (dataIndex) {
                            const event = events.find(e => e.id === dataIndex);
                            return event ? `${event.title} (${label})` : label;
                          }
                          return label;
                        }}
                      />
                    }
                  />
                  <Area
                    dataKey="nota"
                    type="linear"
                    fill="var(--color-nota)"
                    fillOpacity={0.4}
                    stroke="var(--color-nota)"
                    strokeWidth={2}
                    connectNulls
                  />
                  <Area
                    dataKey="redacao"
                    type="linear"
                    fill="var(--color-redacao)"
                    fillOpacity={0.4}
                    stroke="var(--color-redacao)"
                    strokeWidth={2}
                    connectNulls
                  />
                </AreaChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            {chartData.length === 0 
              ? "Nenhum evento com nota encontrado para exibir o gráfico" 
              : "É necessário mais de um evento com nota para gerar o gráfico"}
          </div>
        )}
      </CardContent>
      {hasEnoughData && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                {trend.trending === "up" && (
                  <>Evolução positiva de {trend.percentage}% no período <TrendingUp className="h-4 w-4 text-green-500" /></>
                )}
                {trend.trending === "down" && (
                  <>Queda de {trend.percentage}% no período <TrendingDown className="h-4 w-4 text-red-500" /></>
                )}
                {trend.trending === "neutral" && (
                  <>Sem alteração significativa no período <Minus className="h-4 w-4" /></>
                )}
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                {getPeriodText()}
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
