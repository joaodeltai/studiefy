"use client"

import { useEvents } from "@/hooks/useEvents"
import { useContents } from "@/hooks/useContents"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"
import { PrioritySelector } from "@/components/priority-selector"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function EventPage() {
  const router = useRouter()
  const params = useParams()
  const subjectId = params?.id as string
  const eventId = params?.eventId as string

  const { events, unlinkContent } = useEvents(subjectId)
  const { contents } = useContents(subjectId)

  const event = events.find(e => e.id === eventId)
  const linkedContents = contents.filter(content => 
    event?.content_ids?.includes(content.id)
  )

  if (!event) {
    return null
  }

  const handleUnlink = async (contentId: string) => {
    try {
      await unlinkContent(eventId, contentId)
      toast.success("Conteúdo desassociado com sucesso!")
    } catch (error) {
      toast.error("Erro ao desassociar conteúdo")
    }
  }

  const formattedDate = format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-studiefy-black">{event.title}</h1>
          <p className="text-sm text-studiefy-black/70">
            {formattedDate} • {event.type}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold mb-4">Conteúdos Relacionados</h2>
        {linkedContents.length === 0 ? (
          <p className="text-studiefy-black/70">
            Nenhum conteúdo associado a este evento ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {linkedContents.map((content) => (
              <div
                key={content.id}
                className="flex items-center space-x-4 py-4 px-4 rounded-lg border border-studiefy-black/10 hover:bg-studiefy-black/5 transition-colors"
              >
                <Checkbox 
                  checked={content.completed}
                  className="ml-2"
                  disabled
                />
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => router.push(`/dashboard/subjects/${subjectId}/contents/${content.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-lg",
                      content.completed && "line-through text-studiefy-black/50"
                    )}>
                      {content.title}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-sm text-studiefy-black/70">
                    {content.due_date ? format(new Date(content.due_date), "dd/MM", { locale: ptBR }) : "--/--"}
                  </span>
                  <PrioritySelector
                    priority={content.priority}
                    disabled
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleUnlink(content.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
