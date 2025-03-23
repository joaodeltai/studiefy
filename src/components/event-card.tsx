"use client"

import { Event } from "@/hooks/useEvents"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface EventCardProps {
  event: Event
  subjectId: string
  onDelete: (id: string) => Promise<void>
  onToggleComplete: (id: string) => Promise<void>
}

const eventTypeLabels = {
  prova: "Prova",
  trabalho: "Trabalho",
  simulado: "Simulado",
  redacao: "Redação",
}

export function EventCard({ event, subjectId, onDelete, onToggleComplete }: EventCardProps) {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await onDelete(event.id)
      toast.success("Evento movido para a lixeira")
    } catch (error) {
      toast.error("Erro ao mover evento para a lixeira")
    }
  }

  const handleToggleComplete = async () => {
    try {
      await onToggleComplete(event.id)
      toast.success(
        event.completed
          ? "Avaliação marcada como não concluída"
          : "Avaliação marcada como concluída"
      )
    } catch (error) {
      toast.error("Erro ao atualizar avaliação")
    }
  }

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border border-studiefy-black/10 cursor-pointer",
        event.completed ? "bg-studiefy-black/5" : "bg-white hover:bg-studiefy-black/5"
      )}
      onClick={() => {
        // Verificar se o evento está associado a uma matéria específica
        if (event.subject_id) {
          router.push(`/dashboard/subjects/${subjectId}/events/${event.id}`)
        } else {
          // Para eventos gerais
          router.push(`/dashboard/events/${event.id}`)
        }
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium",
            event.completed && "line-through text-studiefy-black/50"
          )}>
            {event.title}
          </span>
          <span className="text-sm px-2 py-0.5 rounded-full bg-studiefy-black/10">
            {eventTypeLabels[event.type]}
          </span>
        </div>
        <span className="text-sm text-studiefy-black/60">
          {format(new Date(event.date), "PPp", { locale: ptBR })}
        </span>
      </div>
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-green-500 hover:text-green-600 hover:bg-green-50",
            event.completed && "text-studiefy-black/30 hover:text-studiefy-black/50 hover:bg-studiefy-black/10"
          )}
          onClick={handleToggleComplete}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
