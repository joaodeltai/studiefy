"use client"

import { Input } from "@/components/ui/input"
import { PriorityLevel, useContents } from "@/hooks/useContents"
import { useSubjects } from "@/hooks/useSubjects"
import { Checkbox } from "@/components/ui/checkbox"
import { PrioritySelector } from "@/components/priority-selector"
import { DeleteContentDialog } from "@/components/delete-content-dialog"
import { DatePicker } from "@/components/date-picker"
import { ContentFilters } from "@/components/content-filters"
import { Loader2, ChevronLeft, ChevronDown } from "lucide-react"
import { notFound, useRouter, useParams } from "next/navigation"
import { KeyboardEvent, useState } from "react"
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
    loading: loadingContents,
    filters,
    availableTags,
    addContent,
    toggleComplete: toggleContentComplete,
    moveToTrash,
    updatePriority,
    updateDueDate,
    updateFilters,
  } = useContents(subjectId)
  const [newContentTitle, setNewContentTitle] = useState("")
  const [newContentPriority, setNewContentPriority] = useState<PriorityLevel>(null)
  const [newContentDueDate, setNewContentDueDate] = useState<Date | null>(null)
  const [newContentCategoryId, setNewContentCategoryId] = useState<string | null>(null)

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
      } catch (error) {
        toast.error("Erro ao adicionar conteúdo")
      }
    }
  }

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
    <div className="h-full p-4">
      <div className="hidden md:flex flex-col md:flex-row md:items-center md:gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div 
            className="w-4 h-8 rounded-full" 
            style={{ backgroundColor: subject.color }}
          />
          <h1 className="text-3xl font-bold text-studiefy-black">
            {subject.name}
          </h1>
        </div>
        <div className="md:ml-auto flex items-center gap-2">
          <AddEventDialog
            onAddEvent={async (title, type, date) => {
              try {
                // addEvent retorna o evento já atualizado no hook useEvents,
                // então não precisamos fazer nada mais aqui para atualizar a UI
                await addEvent(title, type, date);
                return;
              } catch (error) {
                console.error("Error adding event:", error);
                throw error;
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Adicione um novo conteúdo e pressione Enter (use # para adicionar tags)"
            value={newContentTitle}
            onChange={(e) => setNewContentTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pr-40 h-12"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <DatePicker
              date={newContentDueDate}
              onDateChange={setNewContentDueDate}
            />
            <CategorySelector
              subjectId={subjectId}
              selectedCategoryId={newContentCategoryId}
              onCategoryChange={setNewContentCategoryId}
            />
            <PrioritySelector
              priority={newContentPriority}
              onPriorityChange={setNewContentPriority}
            />
          </div>
        </div>

        <ContentFilters
          subjectId={subjectId}
          startDate={filters.startDate}
          endDate={filters.endDate}
          priority={filters.priority}
          selectedTags={filters.tags}
          categoryId={filters.categoryId}
          availableTags={availableTags}
          onStartDateChange={(date) => updateFilters({ ...filters, startDate: date })}
          onEndDateChange={(date) => updateFilters({ ...filters, endDate: date })}
          onPriorityChange={(priority) => updateFilters({ ...filters, priority })}
          onTagsChange={(tags) => updateFilters({ ...filters, tags })}
          onCategoryChange={(categoryId) => updateFilters({ ...filters, categoryId })}
          onClearFilters={() => updateFilters({
            startDate: null,
            endDate: null,
            priority: 'all',
            tags: [],
            categoryId: null
          })}
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
                  onToggleComplete={toggleComplete}
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
