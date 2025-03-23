"use client"

import * as React from "react"
import { useContents, PriorityLevel, Content } from "@/hooks/useContents"
import { useSubjects } from "@/hooks/useSubjects"
import { usePomodoro, POMODORO_DURATIONS } from "@/hooks/usePomodoro"
import { Checkbox } from "@/components/ui/checkbox"
import { PrioritySelector } from "@/components/priority-selector"
import { DeleteContentDialog } from "@/components/delete-content-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, Info } from "lucide-react"
import { notFound, useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { EditableTitle } from "@/components/editable-title"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { KeyboardEvent, useState, useCallback, useRef, useEffect } from "react"
import { usePageTitle } from "@/contexts/PageTitleContext"
import { NotesEditor } from "@/components/notes-editor"
import { NotesEditorWithControls } from "@/components/notes-editor-with-controls"

interface TimerCircleProps {
  timeLeft: number
  totalTime: number
  children: React.ReactNode
}

function TimerCircle({ timeLeft, totalTime, children }: TimerCircleProps) {
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const progress = ((totalTime - timeLeft) / totalTime) * circumference
  const rotation = -90 // Começa do topo

  return (
    <div className="relative w-[300px] h-[300px]">
      {/* Background circle */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx="150"
          cy="150"
          r={radius}
          className="fill-none stroke-studiefy-black/10"
          strokeWidth="20"
        />
      </svg>
      
      {/* Progress circle */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx="150"
          cy="150"
          r={radius}
          className="fill-none stroke-blue-500 transition-all duration-1000"
          strokeWidth="20"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: '50% 50%'
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}

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

function PomodoroContent({ content, onUpdateFocusTime }: { content: Content, onUpdateFocusTime: (seconds: number) => Promise<void> }) {
  const { timeLeft, isRunning, duration, toggleTimer, resetTimer, setDuration, getFocusedTime } = usePomodoro(content.id)
  const [showDurationOptions, setShowDurationOptions] = useState(false)

  // Salva o tempo focado quando o timer é pausado ou zerado
  const saveFocusTime = React.useCallback(async () => {
    const focusedTime = getFocusedTime()
    if (focusedTime > 0 && (!content.focus_time || focusedTime > content.focus_time)) {
      try {
        await onUpdateFocusTime(focusedTime)
      } catch (error) {
        toast.error("Erro ao salvar tempo focado")
      }
    }
  }, [getFocusedTime, onUpdateFocusTime, content.focus_time])

  // Salva o tempo focado quando o componente é desmontado e o timer está rodando
  React.useEffect(() => {
    return () => {
      if (isRunning) {
        saveFocusTime()
      }
    }
  }, [isRunning, saveFocusTime])

  const handleToggleTimer = async () => {
    if (isRunning) {
      await saveFocusTime()
    }
    toggleTimer()
  }

  const handleResetTimer = async () => {
    if (isRunning) {
      await saveFocusTime()
    }
    resetTimer()
  }

  const handleChangeDuration = async (newDuration: number) => {
    if (isRunning) {
      await saveFocusTime()
    }
    setDuration(newDuration)
    setShowDurationOptions(false)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatTotalFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m em foco`
    }
    return `${minutes}m em foco`
  }

  // Format the current duration in minutes
  const formatDuration = (seconds: number) => {
    return `${Math.floor(seconds / 60)} min`
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 flex flex-col items-center justify-center gap-12">
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <TimerCircle timeLeft={timeLeft} totalTime={duration}>
            <button 
              onClick={() => !isRunning && setShowDurationOptions(prev => !prev)}
              className={cn(
                "flex flex-col items-center", 
                !isRunning && "cursor-pointer hover:text-blue-600 transition-colors"
              )}
              disabled={isRunning}
            >
              <span className="text-5xl font-bold text-studiefy-black">
                {formatTime(timeLeft)}
              </span>
              <span className="text-sm text-studiefy-gray mt-2">
                Tempo restante
              </span>
              {typeof content.focus_time === 'number' && content.focus_time > 0 && (
                <span className="text-xs text-studiefy-gray mt-1">
                  {formatTotalFocusTime(content.focus_time)}
                </span>
              )}
              {!isRunning && (
                <span className="text-xs text-blue-500 mt-1">
                  Clique para alterar ({formatDuration(duration)})
                </span>
              )}
            </button>
          </TimerCircle>

          {/* Duration Options Popover */}
          {showDurationOptions && !isRunning && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg p-4 z-10 border border-gray-200 min-w-[200px]">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-center mb-2">Selecione a duração</h3>
                <button 
                  onClick={() => handleChangeDuration(POMODORO_DURATIONS.SHORT)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-md hover:bg-blue-50 transition-colors text-left",
                    duration === POMODORO_DURATIONS.SHORT && "bg-blue-100 font-medium"
                  )}
                >
                  25 minutos
                </button>
                <button 
                  onClick={() => handleChangeDuration(POMODORO_DURATIONS.MEDIUM)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-md hover:bg-blue-50 transition-colors text-left",
                    duration === POMODORO_DURATIONS.MEDIUM && "bg-blue-100 font-medium"
                  )}
                >
                  30 minutos
                </button>
                <button 
                  onClick={() => handleChangeDuration(POMODORO_DURATIONS.LONG)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-md hover:bg-blue-50 transition-colors text-left",
                    duration === POMODORO_DURATIONS.LONG && "bg-blue-100 font-medium"
                  )}
                >
                  45 minutos
                </button>
                <button 
                  onClick={() => handleChangeDuration(POMODORO_DURATIONS.EXTENDED)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-md hover:bg-blue-50 transition-colors text-left",
                    duration === POMODORO_DURATIONS.EXTENDED && "bg-blue-100 font-medium"
                  )}
                >
                  60 minutos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleToggleTimer}
          className="px-8 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          {isRunning ? "Pausar" : "Começar"}
        </button>
        <button
          onClick={handleResetTimer}
          className="px-8 py-2 rounded-lg border border-studiefy-black/10 hover:bg-studiefy-black/5 transition-colors"
        >
          Reiniciar
        </button>
      </div>
      <span className="text-xs text-studiefy-gray mt-2">
        Tempo salvo automaticamente
      </span>
    </div>
  )
}

interface PageProps {
  params: Promise<{
    id: string
    contentId: string
  }>
}

export default function ContentPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = React.use(params)
  const { setPageTitle, setTitleActions } = usePageTitle()
  const [showContentInfo, setShowContentInfo] = useState(false)
  const contentInfoRef = useRef<HTMLDivElement>(null)
  const btnContentInfoRef = useRef<HTMLButtonElement>(null)
  
  // Define o título da página como "Conteúdo" e adiciona o ícone de informação
  React.useEffect(() => {
    setPageTitle("Conteúdo")
    
    // Adiciona o ícone de informação
    setTitleActions(
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-2 h-8 w-8 rounded-full hover:bg-studiefy-black/10"
          onClick={() => setShowContentInfo(!showContentInfo)}
          ref={btnContentInfoRef}
        >
          <Info className="h-4 w-4 text-studiefy-black/70 hover:text-studiefy-black" />
          <span className="sr-only">Informações sobre Conteúdo</span>
        </Button>
        
        {/* Tooltip de informação */}
        {showContentInfo && (
          <div 
            ref={contentInfoRef}
            className="absolute z-50 top-full left-0 mt-2 w-72 bg-white text-studiefy-black border border-studiefy-black/10 shadow-md p-3 rounded-md text-sm animate-in fade-in-50 duration-200"
            style={{
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
            }}
          >
            <h3 className="text-base font-medium mb-1.5 text-studiefy-black">Sobre Conteúdo</h3>
            <p className="text-studiefy-black/80 mb-1.5 leading-snug">
              <strong>Conteúdo</strong> é um tópico de estudo específico dentro de uma matéria. Aqui você pode gerenciar todos os detalhes deste conteúdo.
            </p>
            <p className="font-medium mb-1 mt-2 text-studiefy-black">Como usar:</p>
            <ul className="list-disc list-inside text-studiefy-black/80 leading-snug">
              <li>Marque como concluído quando finalizar o estudo</li>
              <li>Defina uma prioridade para organizar seus estudos</li>
              <li>Adicione uma data de entrega para não perder prazos</li>
              <li>Use o timer pomodoro para estudar com mais foco</li>
              <li>Faça anotações importantes sobre o conteúdo</li>
            </ul>
          </div>
        )}
      </div>
    )
    
    return () => {
      setPageTitle("")
      setTitleActions(null)
    }
  }, [showContentInfo])
  
  // Fecha o tooltip quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showContentInfo && 
          contentInfoRef.current && 
          btnContentInfoRef.current && 
          !contentInfoRef.current.contains(event.target as Node) &&
          !btnContentInfoRef.current.contains(event.target as Node)) {
        setShowContentInfo(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showContentInfo])
  
  const { subjects, loading: loadingSubjects } = useSubjects()
  const { 
    contents, 
    loading: loadingContents, 
    toggleComplete, 
    moveToTrash, 
    updatePriority, 
    updateDueDate,
    updateFocusTime,
    updateTitle,
    updateNotes
  } = useContents(resolvedParams.id)

  const subject = subjects?.find((s) => s.id === resolvedParams.id)
  const content = contents.find((c) => c.id === resolvedParams.contentId)

  if (loadingSubjects || loadingContents) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  if (!subject || !content) {
    notFound()
  }

  const handleToggle = async () => {
    try {
      await toggleComplete(content.id)
    } catch (error) {
      toast.error("Erro ao atualizar conteúdo")
    }
  }

  const handleDelete = async () => {
    try {
      await moveToTrash(content.id)
      toast.success("Conteúdo movido para a Lixeira")
      router.back()
    } catch (error) {
      toast.error("Erro ao mover conteúdo para a Lixeira")
    }
  }

  const handlePriorityChange = async (newPriority: PriorityLevel) => {
    try {
      await updatePriority(content.id, newPriority)
    } catch (error) {
      toast.error("Erro ao atualizar prioridade")
    }
  }

  const handleDateChange = async (newDate: Date | null) => {
    try {
      await updateDueDate(content.id, newDate)
    } catch (error) {
      toast.error("Erro ao atualizar data")
    }
  }

  const handleUpdateFocusTime = async (seconds: number) => {
    try {
      await updateFocusTime(content.id, seconds)
    } catch (error) {
      toast.error("Erro ao atualizar tempo focado")
    }
  }

  const handleTitleUpdate = async (newTitle: string) => {
    try {
      await updateTitle(content.id, newTitle)
    } catch (error) {
      toast.error("Erro ao atualizar título")
    }
  }

  const handleNotesUpdate = async (notes: string) => {
    try {
      await updateNotes(content.id, notes)
    } catch (error) {
      toast.error("Erro ao atualizar anotações")
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
    <div className="min-h-screen h-full p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* Checkbox e título foram movidos para o topo do Pomodoro */}
        </div>
        <div className="flex items-center gap-2">
          {/* Controles movidos para o topo das anotações */}
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="w-full bg-[#f3f5f3] rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Checkbox 
                checked={content.completed}
                onCheckedChange={handleToggle}
                className="h-5 w-5"
              />
              <EditableTitle
                title={content.title}
                onSave={handleTitleUpdate}
                className="text-xl font-semibold"
              />
            </div>
            <PomodoroContent 
              content={content}
              onUpdateFocusTime={handleUpdateFocusTime}
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="w-full bg-[#f3f5f3] rounded-xl shadow-md p-6 h-full">
            <NotesEditorWithControls 
              notes={content.notes}
              onSave={(notes) => handleNotesUpdate(notes)}
              date={content.due_date}
              onDateChange={handleDateChange}
              priority={content.priority}
              onPriorityChange={handlePriorityChange}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
