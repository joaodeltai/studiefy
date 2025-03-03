"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, BookOpen, Loader2 } from "lucide-react"
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

export default function GradesPage() {
  const router = useRouter()
  const { events, loading } = useGrades()
  const { subjects, loading: loadingSubjects } = useSubjects()
  
  // Estados para os filtros
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  
  // Aplicar filtros
  const filteredEvents = useMemo(() => {
    let filtered = [...events]
    
    // Filtrar por matéria
    if (selectedSubjectId && selectedSubjectId !== "all") {
      filtered = filtered.filter(event => event.subject_id === selectedSubjectId)
    }
    
    // Filtrar por data
    if (selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd")
      filtered = filtered.filter(event => {
        const eventDate = parseISO(event.date)
        if (isValid(eventDate)) {
          return format(eventDate, "yyyy-MM-dd") === dateString
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
  }, [events, selectedSubjectId, selectedDate])
  
  // Limpar filtros
  const clearFilters = () => {
    setSelectedSubjectId("all")
    setSelectedDate(undefined)
  }
  
  if (loading || loadingSubjects) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }
  
  return (
    <div className="h-full p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2" 
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Notas</h1>
      </div>
      
      {/* Estatísticas */}
      {events.length > 0 && (
        <GradeStatistics 
          events={events} 
          subjectId={selectedSubjectId !== "all" ? selectedSubjectId : undefined} 
        />
      )}
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Filtro de Matéria */}
          <div>
            <Label htmlFor="subject-filter" className="mb-2 block">Matéria</Label>
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
          
          {/* Filtro de Data */}
          <div>
            <Label htmlFor="date-filter" className="mb-2 block">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-filter"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Botão para limpar filtros */}
        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="w-full md:w-auto"
        >
          Limpar filtros
        </Button>
      </div>
      
      {/* Conteúdo - Lista de Notas */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <Card 
              key={event.id} 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/dashboard/subjects/${event.subject_id}/events/${event.id}`)}
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
                        style={{ color: event.subject.color }}
                      >
                        {event.subject.name}
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
            {selectedSubjectId !== "all" || selectedDate ? (
              <p className="text-sm mt-2">Tente ajustar os filtros para ver mais resultados</p>
            ) : (
              <p className="text-sm mt-2">Adicione notas aos seus eventos para visualizá-las aqui</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
