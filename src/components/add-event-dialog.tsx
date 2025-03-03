"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DateTimePicker } from "@/components/date-time-picker"
import { Plus } from "lucide-react"
import { EventType } from "@/hooks/useEvents"
import { useState } from "react"
import { toast } from "sonner"

interface AddEventDialogProps {
  onAddEvent: (title: string, type: EventType, date: Date) => Promise<void>
}

const eventTypeLabels = {
  prova: "Prova",
  trabalho: "Trabalho",
  simulado: "Simulado",
  redacao: "Redação",
}

export function AddEventDialog({ onAddEvent }: AddEventDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<EventType>("prova")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title || !type || !date) {
      toast.error("Preencha todos os campos")
      return
    }

    try {
      setLoading(true)
      // Chamar onAddEvent e esperar a resposta
      await onAddEvent(title, type, date)
      
      // Fechar o diálogo e limpar os campos apenas após sucesso
      toast.success("Evento adicionado com sucesso")
      setOpen(false)
      
      // Reset form
      setTitle("")
      setType("prova")
      setDate(undefined)
    } catch (error) {
      toast.error("Erro ao adicionar evento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Eventos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[95vw] sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Adicionar Evento</DialogTitle>
          <DialogDescription>
            Adicione uma prova, trabalho, simulado ou redação à sua matéria.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Prova de Álgebra Linear"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-studiefy-black/10 bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {Object.entries(eventTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Data e Hora</Label>
            <DateTimePicker date={date} setDate={setDate} />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-[#282828] text-white hover:bg-[#c8ff29] hover:text-[#282828]"
          >
            {loading ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
