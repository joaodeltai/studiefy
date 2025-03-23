"use client"

import { Input } from "@/components/ui/input"
import { PriorityLevel, useContents } from "@/hooks/useContents"
import { useSubjects } from "@/hooks/useSubjects"
import { Checkbox } from "@/components/ui/checkbox"
import { PrioritySelector } from "@/components/priority-selector"
import { DeleteContentDialog } from "@/components/delete-content-dialog"
import { DatePicker } from "@/components/date-picker"
import { ContentFilters } from "@/components/content-filters"
import { Loader2, ChevronLeft, ChevronDown, AlertTriangle, CreditCard, PanelLeft, Info } from "lucide-react"
import { notFound, useRouter, useParams } from "next/navigation"
import { KeyboardEvent, useState, useCallback, useRef, useEffect } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useEvents } from "@/hooks/useEvents"
import { AddEventDialog } from "@/components/add-event-dialog"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { CategorySelector } from "@/components/category-selector"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FREE_PLAN_LIMITS } from "@/hooks/usePlanLimits"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { LinkContentDialog } from "@/components/link-content-dialog"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetTrigger 
} from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { useSetPageTitle } from "@/hooks/useSetPageTitle"

interface DateTextProps {
  date: string | null
  onDateChange: (date: Date | null) => Promise<void>
}

function DateText({ date, onDateChange }: DateTextProps) {
  const formattedDate = date 
    ? format(new Date(date), "dd/MM", { locale: ptBR })
    : "--/--"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className={cn(
            "text-sm transition-colors",
            date ? "text-studiefy-black/70" : "text-studiefy-black/50",
            "hover:text-studiefy-black"
          )}
        >
          {formattedDate}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={date ? new Date(date) : undefined}
          onSelect={(newDate) => onDateChange(newDate || null)}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}

interface ContentCardProps {
  id: string
  subjectId: string
  title: string
  completed: boolean
  priority: PriorityLevel
  dueDate: string | null
  categoryId: string | null
  tags?: string[]
  onToggleComplete: (id: string) => Promise<void>
  onMoveToTrash: (id: string) => Promise<void>
  onUpdatePriority: (id: string, priority: PriorityLevel) => Promise<void>
  onUpdateDueDate: (id: string, dueDate: Date | null) => Promise<void>
}

function ContentCard({ 
  id, 
  subjectId,
  title, 
  completed, 
  priority,
  dueDate,
  categoryId,
  tags = [], 
  onToggleComplete,
  onMoveToTrash,
  onUpdatePriority,
  onUpdateDueDate,
}: ContentCardProps) {
  const router = useRouter()

  const handleToggle = async () => {
    try {
      await onToggleComplete(id)
    } catch (error) {
      toast.error("Erro ao atualizar conteúdo")
    }
  }

  const handleDelete = async () => {
    try {
      await onMoveToTrash(id)
      toast.success("Conteúdo movido para a Lixeira")
    } catch (error) {
      toast.error("Erro ao mover conteúdo para a Lixeira")
    }
  }

  const handlePriorityChange = async (newPriority: PriorityLevel) => {
    try {
      await onUpdatePriority(id, newPriority)
    } catch (error) {
      toast.error("Erro ao atualizar prioridade")
    }
  }

  const handleDateChange = async (newDate: Date | null) => {
    try {
      await onUpdateDueDate(id, newDate)
    } catch (error) {
      toast.error("Erro ao atualizar data")
    }
  }

  const renderTitleWithTags = (text: string) => {
    const parts = text.split(/(#\w+)/)
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="font-bold text-blue-500">
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-studiefy-black/10 hover:bg-studiefy-black/5 transition-colors">
      <Checkbox 
        checked={completed}
        onCheckedChange={handleToggle}
        className="ml-4"
      />
      <div 
        className="flex-1 cursor-pointer"
        onClick={() => !completed && router.push(`/dashboard/subjects/${subjectId}/contents/${id}`)}
      >
        <div className="flex items-center gap-2">
          <span className={cn("text-lg", completed && "line-through text-studiefy-black/50")}>
            {renderTitleWithTags(title)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 mr-4" onClick={(e) => e.stopPropagation()}>
        <LinkContentDialog contentId={id} subjectId={subjectId} />
        <DateText
          date={dueDate}
          onDateChange={handleDateChange}
        />
        <PrioritySelector
          priority={priority}
          onPriorityChange={handlePriorityChange}
        />
        <DeleteContentDialog onConfirm={handleDelete} />
      </div>
    </div>
  )
}

export default function SubjectPage() {
  const router = useRouter()
  const params = useParams()
  const subjectId = params?.id as string

  const { subjects, loading: loadingSubject } = useSubjects()
  const { events, loading: eventsLoading, addEvent, deleteEvent: moveEventToTrash, toggleComplete } = useEvents(subjectId)
  const {
    contents,
    allContents,
    loading: loadingContents,
    filters,
    availableTags,
    addContent,
    toggleComplete: toggleContentComplete,
    moveToTrash,
    updatePriority,
    updateDueDate,
    updateFilters,
    hasReachedLimit,
    remainingContents
  } = useContents(subjectId)
  const [newContentTitle, setNewContentTitle] = useState("")
  const [newContentPriority, setNewContentPriority] = useState<PriorityLevel>(null)
  const [newContentDueDate, setNewContentDueDate] = useState<Date | null>(null)
  const [newContentCategoryId, setNewContentCategoryId] = useState<string | null>(null)
  const [localCategoryId, setLocalCategoryId] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [showMobileInfo, setShowMobileInfo] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)
  const btnInfoRef = useRef<HTMLButtonElement>(null)
  const btnMobileInfoRef = useRef<HTMLButtonElement>(null)
  const mobileInfoRef = useRef<HTMLDivElement>(null)
  
  // Define o título da página dinamicamente com base no nome da matéria
  const subject = subjects?.find(s => s.id === subjectId)
  useSetPageTitle(subject ? subject.name : 'Conteúdos')

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Para desktop
      if (showInfo && 
          infoRef.current && 
          btnInfoRef.current && 
          !infoRef.current.contains(event.target as Node) &&
          !btnInfoRef.current.contains(event.target as Node)) {
        setShowInfo(false)
      }
      
      // Para mobile
      if (showMobileInfo && 
          mobileInfoRef.current && 
          btnMobileInfoRef.current && 
          !mobileInfoRef.current.contains(event.target as Node) &&
          !btnMobileInfoRef.current.contains(event.target as Node)) {
        setShowMobileInfo(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showInfo, showMobileInfo])

  // Função adaptadora para toggleComplete
  const handleToggleEventComplete = async (id: string) => {
    const event = events.find(e => e.id === id);
    if (event) {
      await toggleComplete(id, !event.completed);
    }
  }

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newContentTitle.trim()) {
      try {
        await addContent({
          title: newContentTitle,
          priority: newContentPriority,
          dueDate: newContentDueDate,
          categoryId: newContentCategoryId
        })
        setNewContentTitle("")
        setNewContentPriority(null)
        setNewContentDueDate(null)
        setNewContentCategoryId(null)
        toast.success("Conteúdo adicionado com sucesso")
      } catch (error: any) {
        // Não exibe toast de erro aqui, pois o erro já é tratado no hook de useContents
        console.error("Erro ao adicionar conteúdo:", error)
      }
    }
  }

  const handleStartDateChange = useCallback((date: Date | null) => {
    if (typeof updateFilters === 'function') {
      updateFilters({ ...filters, startDate: date })
    }
  }, [filters, updateFilters])

  const handleEndDateChange = useCallback((date: Date | null) => {
    if (typeof updateFilters === 'function') {
      updateFilters({ ...filters, endDate: date })
    }
  }, [filters, updateFilters])

  const handlePriorityChange = useCallback((priority: PriorityLevel | 'all') => {
    if (typeof updateFilters === 'function') {
      updateFilters({ ...filters, priority })
    }
  }, [filters, updateFilters])

  const handleTagsChange = useCallback((tags: string[]) => {
    if (typeof updateFilters === 'function') {
      updateFilters({ ...filters, tags })
    }
  }, [filters, updateFilters])

  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setLocalCategoryId(categoryId);
    if (typeof updateFilters === 'function') {
      updateFilters({ ...filters, categoryId })
    }
  }, [filters, updateFilters])

  const handleClearFilters = useCallback(() => {
    if (typeof updateFilters === 'function') {
      updateFilters({
        startDate: null,
        endDate: null,
        priority: 'all',
        tags: [],
        categoryId: null
      })
    }
  }, [updateFilters])

  if (loadingSubject || loadingContents || eventsLoading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  if (!subject) {
    notFound()
  }

  const filteredContents = contents.filter(content => !content.deleted)

  const activeContents = filteredContents.filter(content => !content.completed)
  const completedContents = filteredContents.filter(content => content.completed)

  return (
    <div className="min-h-screen h-full p-4 pt-0">
      {/* Alertas de limite */}
      {hasReachedLimit ? (
        <Alert variant="destructive" className="mb-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>
              Você atingiu o limite de {FREE_PLAN_LIMITS.MAX_CONTENTS_PER_SUBJECT} conteúdos por matéria no plano Free.
            </span>
            <Button 
              size="sm"
              className="ml-2 flex items-center gap-1"
              onClick={() => router.push('/dashboard/subscription')}
            >
              <CreditCard className="h-4 w-4" />
              <span>Fazer Upgrade</span>
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        typeof remainingContents === 'number' && 
        remainingContents <= 3 && 
        remainingContents > 0 && (
          <Alert variant="warning" className="mb-3 border-amber-300 bg-amber-50 dark:bg-amber-900/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-600 dark:text-amber-400">
              Você pode adicionar mais {remainingContents} {remainingContents === 1 ? 'conteúdo' : 'conteúdos'} nesta matéria no plano Free.
            </AlertDescription>
          </Alert>
        )
      )}
      
      {/* Filtros e barra de pesquisa */}
      <div className="mb-4 flex flex-col gap-3" data-component-name="SubjectPage">
        {/* Barra de pesquisa */}
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Adicione um novo conteúdo e pressione Enter (use # para adicionar tags)"
            value={newContentTitle}
            onChange={(e) => setNewContentTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pr-40 h-12"
            disabled={hasReachedLimit}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <DatePicker
              date={newContentDueDate}
              onDateChange={setNewContentDueDate}
              disabled={hasReachedLimit}
            />
            <CategorySelector
              subjectId={subjectId}
              selectedCategoryId={newContentCategoryId}
              onCategoryChange={setNewContentCategoryId}
              disabled={hasReachedLimit}
            />
            <PrioritySelector
              priority={newContentPriority}
              onPriorityChange={setNewContentPriority}
              disabled={hasReachedLimit}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="w-full">
          <ContentFilters
            subjectId={subjectId}
            startDate={filters.startDate}
            endDate={filters.endDate}
            priority={filters.priority}
            selectedTags={filters.tags}
            categoryId={filters.categoryId || localCategoryId}
            availableTags={availableTags}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onPriorityChange={handlePriorityChange}
            onTagsChange={handleTagsChange}
            onCategoryChange={handleCategoryChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
      
      {/* Lista de eventos */}
      {events.filter(event => !event.completed).length > 0 && (
        <Accordion type="single" collapsible className="w-full mb-4">
          <AccordionItem value="events" className="border border-studiefy-black/10 rounded-lg shadow-sm">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="flex items-center gap-2 text-lg font-semibold text-studiefy-black" data-component-name="SubjectPage">
                Próximos eventos desta Disciplina
                <span className="text-sm font-normal text-studiefy-black/50">
                  ({events.filter(event => !event.completed).length})
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3 p-4 pt-0">
                {events
                  .filter(event => !event.completed)
                  .map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      subjectId={subjectId}
                      onDelete={moveEventToTrash}
                      onToggleComplete={handleToggleEventComplete}
                    />
                  ))
                }
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Conteúdos */}
      <div className="flex flex-col gap-4 pb-6">
        <Accordion type="single" defaultValue="contents" collapsible className="w-full">
          <AccordionItem value="contents" className="border border-studiefy-black/10 rounded-lg shadow-sm">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="flex items-center gap-2 text-lg font-semibold text-studiefy-black">
                Conteúdos
                <span className="text-sm font-normal text-studiefy-black/50">
                  ({activeContents.length})
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3 p-4 pt-0">
                {/* Conteúdos ativos */}
                {activeContents.map((content) => (
                  <ContentCard
                    key={content.id}
                    id={content.id}
                    subjectId={subjectId}
                    title={content.title}
                    completed={content.completed}
                    priority={content.priority}
                    dueDate={content.due_date}
                    categoryId={content.category_id}
                    tags={content.tags}
                    onToggleComplete={toggleContentComplete}
                    onMoveToTrash={moveToTrash}
                    onUpdatePriority={updatePriority}
                    onUpdateDueDate={updateDueDate}
                  />
                ))}

                {/* Conteúdos completados */}
                {completedContents.length > 0 && (
                  <Accordion type="single" collapsible className="w-full mt-2">
                    <AccordionItem value="completed" className="border border-studiefy-black/10 rounded-lg">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <span className="flex items-center gap-2 text-sm font-medium text-studiefy-black/70">
                          Completados
                          <span className="text-xs font-normal text-studiefy-black/50">
                            ({completedContents.length})
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-3 p-4 pt-0">
                          {completedContents.map((content) => (
                            <ContentCard
                              key={content.id}
                              id={content.id}
                              subjectId={subjectId}
                              title={content.title}
                              completed={content.completed}
                              priority={content.priority}
                              dueDate={content.due_date}
                              categoryId={content.category_id}
                              tags={content.tags}
                              onToggleComplete={toggleContentComplete}
                              onMoveToTrash={moveToTrash}
                              onUpdatePriority={updatePriority}
                              onUpdateDueDate={updateDueDate}
                            />
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
