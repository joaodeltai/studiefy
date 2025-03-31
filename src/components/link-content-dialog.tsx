"use client"

import * as React from "react"
import { Link, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { useEvents, Event } from "@/hooks/useEvents"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface LinkContentDialogProps {
  contentId: string
  subjectId: string
}

export function LinkContentDialog({ contentId, subjectId }: LinkContentDialogProps) {
  const [open, setOpen] = React.useState(false)
  const { events, linkContent } = useEvents(subjectId)

  const availableEvents = events.filter(event => !event.completed)

  const handleSelect = async (eventId: string) => {
    try {
      await linkContent(eventId, contentId)
      toast.success("Conteúdo associado com sucesso!")
      setOpen(false)
    } catch (error) {
      toast.error("Erro ao associar conteúdo")
    }
  }

  // Verificar quais eventos já estão associados a este conteúdo
  const isEventLinked = (event: Event) => {
    return event.content_ids?.includes(contentId) || false
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
        >
          <Link className="h-4 w-4 opacity-50 hover:opacity-100" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar evento..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhum evento encontrado.</CommandEmpty>
            <CommandGroup>
              {availableEvents.map((event) => (
                <CommandItem
                  key={event.id}
                  value={event.id}
                  onSelect={() => handleSelect(event.id)}
                  className="flex justify-between items-center"
                  disabled={isEventLinked(event)}
                >
                  <div className="flex flex-col">
                    <span>{event.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(event.date), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  {isEventLinked(event) && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
