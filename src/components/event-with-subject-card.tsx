"use client"

import { EventWithSubject } from "@/hooks/useAllEvents"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Trash2, Check } from "lucide-react"
import { Button } from "./ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface EventWithSubjectCardProps {
  event: EventWithSubject
  onDelete: (id: string) => Promise<void>
  onToggleComplete: (id: string) => Promise<void>
}

const eventTypeLabels = {
  prova: "Prova",
  trabalho: "Trabalho",
  simulado: "Simulado",
  redacao: "Redação",
}

export function EventWithSubjectCard({ event, onDelete, onToggleComplete }: EventWithSubjectCardProps) {
  const router = useRouter()
  
  const handleDelete = async () => {
    try {
      await onDelete(event.id)
      toast.success("Evento removido com sucesso")
    } catch (error) {
      toast.error("Erro ao remover evento")
    }
  }

  const handleToggleComplete = async () => {
    try {
      await onToggleComplete(event.id)
      toast.success(event.completed ? "Avaliação marcada como pendente" : "Avaliação concluída com sucesso")
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
      onClick={() => router.push(`/dashboard/subjects/${event.subject_id}/events/${event.id}`)}
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-2 h-12 rounded-full" 
          style={{ backgroundColor: event.subject.color }}
        />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium",
              event.completed && "line-through text-studiefy-black/50"
            )}>{event.title}</span>
            <span className="text-sm px-2 py-0.5 rounded-full bg-studiefy-black/10">
              {eventTypeLabels[event.type]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-studiefy-black/60">
            <span>{event.subject.name}</span>
            <span>•</span>
            <span>{format(new Date(event.date), "PPp", { locale: ptBR })}</span>
          </div>
        </div>
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
