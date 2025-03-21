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
  const { events, loading: eventsLoading, addEvent, deleteEvent, toggleComplete } = useEvents(subjectId)
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

  // Função adaptadora para toggleComplete
  const handleToggleEventComplete = async (id: string) => {
    const event = events.find(e => e.id === id);
    if (event) {
      await toggleComplete(id, !event.completed);
    }
  }

  const subject = subjects?.find((s) => s.id === subjectId)

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
    <div className="min-h-screen h-full p-4">
      {/* Header para telas médias e grandes */}
      <div className="hidden md:flex flex-col md:flex-row md:items-center md:gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-8 rounded-full ml-12" 
            style={{ backgroundColor: subject.color }}
          />
          <h1 className="text-3xl font-bold text-studiefy-black">
            {subject.name}
          </h1>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-1 h-8 w-8 rounded-full hover:bg-studiefy-black/10"
              onClick={() => setShowInfo(!showInfo)}
              ref={btnRef}
            >
              <Info className="h-4 w-4 text-studiefy-black/70 hover:text-studiefy-black" />
              <span className="sr-only">Informações sobre Conteúdos</span>
            </Button>
            
            {showInfo && (
              <div 
                ref={infoRef}
                className="absolute z-50 top-full left-0 mt-2 w-72 bg-white text-studiefy-black border border-studiefy-black/10 shadow-md p-3 rounded-md text-sm animate-in fade-in-50 duration-200"
                style={{
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                }}
              >
                <h3 className="text-base font-medium mb-1.5 text-studiefy-black">Sobre Conteúdos</h3>
                <p className="text-studiefy-black/80 mb-1.5 leading-snug">
                  <strong>Conteúdos</strong> são os tópicos de estudo dentro de cada matéria. Aqui você pode organizar tudo o que precisa estudar e acompanhar seu progresso.
                </p>
                <p className="font-medium mb-1 mt-2 text-studiefy-black">Como usar:</p>
                <ul className="list-disc list-inside text-studiefy-black/80 leading-snug">
                  <li>Adicione novos conteúdos digitando e pressionando Enter</li>
                  <li>Use # para adicionar tags aos seus conteúdos</li>
                  <li>Defina prioridades, datas e categorias para organizar melhor</li>
                  <li>Marque como concluído ao finalizar o estudo de um conteúdo</li>
                  <li>Clique em um conteúdo para acessar seus detalhes e anotações</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="md:ml-auto flex items-center gap-2">
          <AddEventDialog
            subjectId={subjectId}
            onAddEvent={async (title, type, date, subjectId) => {
              try {
                // Usar o subjectId passado como parâmetro
                const result = await addEvent(title, type, date);
                toast.success("Evento adicionado com sucesso");
                return result;
              } catch (error: any) {
                // Não exibir toast de erro se já foi exibido pelo hook de eventos
                if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
                  toast.error("Erro ao adicionar evento");
                }
                // Propagar o erro para que o componente AddEventDialog possa tratá-lo
                throw error;
              }
            }}
          />
        </div>
      </div>

      {/* Header para telas pequenas */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2">
                <PanelLeft className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu de Navegação</SheetTitle>
              </SheetHeader>
              <Sidebar isCollapsed={false} onCollapseChange={() => {}} showToggle={false} />
            </SheetContent>
          </Sheet>
          <div 
            className="w-3 h-6 rounded-full" 
            style={{ backgroundColor: subject.color }}
          />
          <h1 className="text-2xl font-bold text-studiefy-black">
            {subject.name}
          </h1>
        </div>
        <AddEventDialog
          subjectId={subjectId}
          onAddEvent={async (title, type, date, subjectId) => {
            try {
              const result = await addEvent(title, type, date);
              toast.success("Evento adicionado com sucesso");
              return result;
            } catch (error: any) {
              if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
                toast.error("Erro ao adicionar evento");
              }
              throw error;
            }
          }}
        />
      </div>

      <div className="space-y-2">
        {hasReachedLimit ? (
          <Alert variant="destructive" className="mb-4">
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
            <Alert variant="warning" className="mb-4 border-amber-300 bg-amber-50 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-600 dark:text-amber-400">
                Você pode adicionar mais {remainingContents} {remainingContents === 1 ? 'conteúdo' : 'conteúdos'} nesta matéria no plano Free.
              </AlertDescription>
            </Alert>
          )
        )}
        
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

        {/* Lista de eventos */}
        {events.filter(event => !event.completed).length > 0 && (
          <div className="grid gap-4">
            {events
              .filter(event => !event.completed)
              .map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  subjectId={subjectId}
                  onDelete={deleteEvent}
                  onToggleComplete={handleToggleEventComplete}
                />
              ))
            }
          </div>
        )}

        {/* Conteúdos */}
        <div className="flex flex-col gap-6 pb-6">
          <div className="flex flex-col gap-4">
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

            {/* Accordion de conteúdos concluídos */}
            {completedContents.length > 0 && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="completed-contents" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <span className="flex items-center gap-2">
                      Concluídos
                      <span className="text-sm text-studiefy-black/50">
                        ({completedContents.length})
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-4 p-4 pt-0">
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
        </div>
      </div>
    </div>
  )
}
