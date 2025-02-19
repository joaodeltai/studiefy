"use client"

import { ContentWithSubject } from "@/hooks/useAllContents"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { PrioritySelector } from "@/components/priority-selector"
import { DatePicker } from "@/components/date-picker"
import { DeleteContentDialog } from "@/components/delete-content-dialog"
import { cn } from "@/lib/utils"
import { PriorityLevel } from "@/hooks/useContents"
import { toast } from "sonner"

interface ContentWithSubjectCardProps {
  content: ContentWithSubject
  onToggleComplete: (id: string) => Promise<void>
  onMoveToTrash: (id: string) => Promise<void>
  onUpdatePriority: (id: string, priority: PriorityLevel) => Promise<void>
  onUpdateDueDate: (id: string, dueDate: Date | null) => Promise<void>
}

export function ContentWithSubjectCard({
  content,
  onToggleComplete,
  onMoveToTrash,
  onUpdatePriority,
  onUpdateDueDate,
}: ContentWithSubjectCardProps) {
  const router = useRouter()

  const handleToggle = async () => {
    try {
      await onToggleComplete(content.id)
    } catch (error) {
      toast.error("Erro ao atualizar conteúdo")
    }
  }

  const handleDelete = async () => {
    try {
      await onMoveToTrash(content.id)
      toast.success("Conteúdo movido para a Lixeira")
    } catch (error) {
      toast.error("Erro ao mover conteúdo para a Lixeira")
    }
  }

  const handlePriorityChange = async (newPriority: PriorityLevel) => {
    try {
      await onUpdatePriority(content.id, newPriority)
    } catch (error) {
      toast.error("Erro ao atualizar prioridade")
    }
  }

  const handleDateChange = async (newDate: Date | null) => {
    try {
      await onUpdateDueDate(content.id, newDate)
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
      <div 
        className="w-1 h-12 rounded-full ml-4" 
        style={{ backgroundColor: content.subject.color }}
      />
      <Checkbox 
        checked={content.completed}
        onCheckedChange={handleToggle}
      />
      <div 
        className="flex-1 cursor-pointer"
        onClick={() => !content.completed && router.push(`/dashboard/subjects/${content.subject_id}/contents/${content.id}`)}
      >
        <div className="flex items-center gap-2">
          <span className={cn("text-lg", content.completed && "line-through text-studiefy-black/50")}>
            {renderTitleWithTags(content.title)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-studiefy-black/60">
          <span>{content.subject.name}</span>
          {content.due_date && (
            <>
              <span>•</span>
              <span>{format(new Date(content.due_date), "PPp", { locale: ptBR })}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mr-4" onClick={(e) => e.stopPropagation()}>
        <DatePicker
          date={content.due_date ? new Date(content.due_date) : null}
          onDateChange={handleDateChange}
        />
        <PrioritySelector
          priority={content.priority}
          onPriorityChange={handlePriorityChange}
        />
        <DeleteContentDialog onConfirm={handleDelete} />
      </div>
    </div>
  )
}
