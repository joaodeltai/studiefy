"use client"

import * as React from "react"
import { useContents, PriorityLevel, Content } from "@/hooks/useContents"
import { useSubjects } from "@/hooks/useSubjects"
import { usePomodoro } from "@/hooks/usePomodoro"
import { Checkbox } from "@/components/ui/checkbox"
import { PrioritySelector } from "@/components/priority-selector"
import { DeleteContentDialog } from "@/components/delete-content-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft } from "lucide-react"
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
  const { timeLeft, isRunning, toggleTimer, resetTimer, getFocusedTime } = usePomodoro(content.id)

  // Salva o tempo focado quando o timer é pausado ou zerado
  const saveFocusTime = React.useCallback(async () => {
    const focusedTime = getFocusedTime()
    if (focusedTime > 0 && focusedTime > content.focus_time) {
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

  return (
    <div className="w-full max-w-2xl mx-auto px-4 flex flex-col items-center justify-center gap-12">
      <div className="flex flex-col items-center gap-2">
        <TimerCircle timeLeft={timeLeft} totalTime={45 * 60}>
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
        </TimerCircle>
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
  const { subjects, loading: loadingSubjects } = useSubjects()
  const { 
    contents, 
    loading: loadingContents, 
    toggleComplete, 
    moveToTrash, 
    updatePriority, 
    updateDueDate,
    updateFocusTime,
    updateTitle
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
    <div className="h-full p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Checkbox 
          checked={content.completed}
          onCheckedChange={handleToggle}
          className="h-5 w-5"
        />

        <div className="flex-1">
          <EditableTitle
            title={content.title}
            onSave={handleTitleUpdate}
            className="text-xl font-semibold"
          />
        </div>

        <div className="flex items-center gap-2">
          <DateText
            date={content.due_date}
            onDateChange={handleDateChange}
          />
          <PrioritySelector
            priority={content.priority}
            onPriorityChange={handlePriorityChange}
          />
          <DeleteContentDialog onDelete={handleDelete} />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <PomodoroContent 
          content={content}
          onUpdateFocusTime={handleUpdateFocusTime}
        />
      </div>
    </div>
  )
}
