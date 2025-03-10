"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Calendar, BookOpen, Loader2, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGrades } from "@/hooks/useGrades"
import { useSubjects } from "@/hooks/useSubjects"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, parseISO, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GradeStatistics } from "@/components/grade-statistics"
import { GradesChart } from "@/components/grades-chart"
import { PremiumGradesPage } from "@/components/premium-grades-page"

export default function GradesPage() {
  const router = useRouter()
  const { events, loading } = useGrades()
  const { subjects, loading: loadingSubjects } = useSubjects()
  
  // Estados para os filtros
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [showInfo, setShowInfo] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  
  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showInfo && 
          infoRef.current && 
          btnRef.current && 
          !infoRef.current.contains(event.target as Node) &&
          !btnRef.current.contains(event.target as Node)) {
        setShowInfo(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showInfo])
  
  // Aplicar filtros
  const filteredEvents = useMemo(() => {
    let filtered = [...events]
    
    // Filtrar por matéria
    if (selectedSubjectId && selectedSubjectId !== "all") {
      filtered = filtered.filter(event => event.subject_id === selectedSubjectId)
    }
    
    // Filtrar por data inicial
    if (startDate) {
      const dateString = format(startDate, "yyyy-MM-dd")
      filtered = filtered.filter(event => {
        const eventDate = parseISO(event.date)
        if (isValid(eventDate)) {
          return format(eventDate, "yyyy-MM-dd") >= dateString
        }
        return false
      })
    }
    
    // Filtrar por data final
    if (endDate) {
      const dateString = format(endDate, "yyyy-MM-dd")
      filtered = filtered.filter(event => {
        const eventDate = parseISO(event.date)
        if (isValid(eventDate)) {
          return format(eventDate, "yyyy-MM-dd") <= dateString
        }
        return false
      })
    }
    
    // Ordenar por data (mais recente primeiro)
    return filtered.sort((a, b) => {
      const dateA = parseISO(a.date)
      const dateB = parseISO(b.date)
      if (isValid(dateA) && isValid(dateB)) {
        return dateB.getTime() - dateA.getTime()
      }
      return 0
    })
  }, [events, selectedSubjectId, startDate, endDate])
  
  // Limpar filtros
  const clearFilters = () => {
    setSelectedSubjectId("all")
    setStartDate(undefined)
    setEndDate(undefined)
  }
  
  if (loading || loadingSubjects) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }
  
  // Conteúdo da página
  const content = (
    <div className="min-h-screen h-full p-4">
      {/* Header */}
      <div className="flex items-center mb-6 md:pl-12">
        <h1 className="text-2xl font-bold">Notas</h1>
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-2 h-8 w-8 rounded-full hover:bg-studiefy-black/10"
            onClick={() => setShowInfo(!showInfo)}
            ref={btnRef}
          >
            <Info className="h-4 w-4 text-studiefy-black/70 hover:text-studiefy-black" />
            <span className="sr-only">Informações sobre Notas</span>
          </Button>
          
          {showInfo && (
            <div 
              ref={infoRef}
              className="absolute z-50 top-full left-0 mt-2 w-72 bg-white text-studiefy-black border border-studiefy-black/10 shadow-md p-3 rounded-md text-sm animate-in fade-in-50 duration-200"
              style={{
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
              }}
            >
              <h3 className="text-base font-medium mb-1.5 text-studiefy-black">Sobre Notas</h3>
              <p className="text-studiefy-black/80 mb-1.5 leading-snug">
                <strong>Notas</strong> é onde você acompanha seu desempenho em todas as avaliações, visualizando estatísticas e gráficos que mostram sua evolução ao longo do tempo.
              </p>
              <p className="font-medium mb-1 mt-2 text-studiefy-black">Como usar:</p>
              <ul className="list-disc list-inside text-studiefy-black/80 leading-snug">
                <li>Filtre por matéria e período para análises específicas</li>
                <li>Visualize sua média geral e por matéria</li>
                <li>Acompanhe sua evolução através dos gráficos</li>
                <li>Veja detalhes de cada avaliação na lista abaixo</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Filtros */}
      <div className="mb-6">
        <div className="flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            {/* Filtro de Matéria */}
            <div>
              <Select 
                value={selectedSubjectId} 
                onValueChange={setSelectedSubjectId}
              >
                <SelectTrigger id="subject-filter" className="w-full">
                  <SelectValue placeholder="Todas as matérias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as matérias</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Filtro de Data Inicial */}
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date-filter"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Data inicial</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Filtro de Data Final */}
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date-filter"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Data final</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Botão para limpar filtros - Aparece apenas quando há filtros ativos */}
          {(selectedSubjectId !== "all" || startDate || endDate) && (
            <div className="ml-2">
              <Button 
                variant="outline"
                onClick={clearFilters}
                size="sm"
                className="h-9 w-9 p-0 rounded-lg border border-studiefy-black/10 text-studiefy-gray hover:text-studiefy-black"
              >
                <span className="sr-only">Limpar filtros</span>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Estatísticas */}
      {filteredEvents.length > 0 && (
        <GradeStatistics 
          events={filteredEvents} 
          subjectId={selectedSubjectId !== "all" ? selectedSubjectId : undefined} 
        />
      )}
      
      {/* Gráfico de Evolução de Notas */}
      <div className="mb-6">
        <GradesChart 
          events={filteredEvents}
          subjectId={selectedSubjectId !== "all" ? selectedSubjectId : undefined}
        />
      </div>
      
      {/* Conteúdo - Lista de Notas */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <Card 
              key={event.id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                if (event.subject_id) {
                  router.push(`/dashboard/subjects/${event.subject_id}/events/${event.id}`)
                } else {
                  router.push(`/dashboard/events/${event.id}`)
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  {/* Data e Tipo */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {isValid(parseISO(event.date)) 
                      ? format(parseISO(event.date), "dd/MM/yyyy", { locale: ptBR })
                      : "Data não disponível"
                    }
                    <Badge 
                      variant="outline" 
                      className="ml-2 capitalize"
                    >
                      {event.type === 'redacao' ? 'Redação' : event.type}
                    </Badge>
                  </div>
                  
                  {/* Título e Matéria */}
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{event.title}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span 
                        className="font-medium" 
                        style={{ color: event.subject?.color }}
                      >
                        {event.subject?.name || "Evento Geral"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Notas */}
                  <div className="flex flex-col items-end gap-1 mt-2 md:mt-0">
                    {event.grade !== null && event.grade !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Nota:</span>
                        <span className="font-semibold text-lg">
                          {typeof event.grade === 'number' 
                            ? event.grade.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : event.grade
                          }
                        </span>
                      </div>
                    )}
                    
                    {event.essay_grade !== null && event.essay_grade !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Nota da redação:</span>
                        <span className="font-semibold text-lg">
                          {typeof event.essay_grade === 'number' 
                            ? event.essay_grade.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : event.essay_grade
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg">Nenhuma nota encontrada</p>
            {selectedSubjectId !== "all" || startDate || endDate ? (
              <p className="text-sm mt-2">Tente ajustar os filtros para ver mais resultados</p>
            ) : (
              <p className="text-sm mt-2">Adicione notas aos seus eventos para visualizá-las aqui</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  // Envolve o conteúdo com o PremiumGradesPage
  // O componente PremiumGradesPage já controla o que deve ser exibido com base
  // no status premium do usuário
  return <PremiumGradesPage>{content}</PremiumGradesPage>;
}
