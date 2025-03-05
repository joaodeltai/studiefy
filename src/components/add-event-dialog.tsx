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
import { Plus, AlertTriangle, CreditCard } from "lucide-react"
import { EventType } from "@/hooks/useEvents"
import { useState } from "react"
import { toast } from "sonner"
import { useSubjects } from "@/hooks/useSubjects"
import { useEvents } from "@/hooks/useEvents"
import { usePlanLimits, FREE_PLAN_LIMITS } from "@/hooks/usePlanLimits"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

interface AddEventDialogProps {
  onAddEvent: (title: string, type: EventType, date: Date, subjectId?: string) => Promise<void>;
  subjectId?: string;
  showSubjectSelector?: boolean;
}

const eventTypeLabels = {
  prova: "Prova",
  trabalho: "Trabalho",
  simulado: "Simulado",
  redacao: "Redação",
}

export function AddEventDialog({ onAddEvent, subjectId, showSubjectSelector = false }: AddEventDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<EventType>("prova")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(subjectId)
  const [loading, setLoading] = useState(false)
  const { subjects } = useSubjects()
  const { allEvents, hasReachedLimit: hasReachedSubjectLimit } = useEvents(subjectId || "")
  const { isPremium } = usePlanLimits()
  const router = useRouter()

  // Verificar limites de eventos gerais
  const generalEvents = allEvents.filter(event => event.subject_id === null);
  const hasReachedGeneralLimit = !isPremium && 
    generalEvents.length >= FREE_PLAN_LIMITS.MAX_GENERAL_EVENTS;

  // Determinar qual limite verificar com base em subjectId
  const hasReachedLimit = subjectId ? hasReachedSubjectLimit : hasReachedGeneralLimit;

  const handleSubmit = async () => {
    if (!title || !type || !date) {
      toast.error("Preencha todos os campos")
      return
    }

    try {
      setLoading(true)
      // Chamar onAddEvent e esperar a resposta
      await onAddEvent(title, type, date, selectedSubjectId)
      
      // Fechar o diálogo e limpar os campos apenas após sucesso
      setOpen(false)
      
      // Reset form
      setTitle("")
      setType("prova")
      setDate(undefined)
      if (showSubjectSelector) {
        setSelectedSubjectId(undefined)
      }
    } catch (error: any) {
      // Não exibir toast de erro se já foi exibido pelo hook
      if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
        toast.error("Erro ao adicionar evento")
      }
      
      // Se foi um erro de limite, não fechamos o modal
      if (error.code === 'PLAN_LIMIT_REACHED') {
        return;
      }
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
          disabled={hasReachedLimit}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Eventos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[95vw] sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Adicionar Evento</DialogTitle>
          <DialogDescription>
            Adicione uma prova, trabalho, simulado ou redação.
          </DialogDescription>
        </DialogHeader>
        
        {hasReachedLimit ? (
          <Alert variant="destructive" className="my-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex flex-col space-y-2">
              <span>
                {subjectId 
                  ? `Você atingiu o limite de ${FREE_PLAN_LIMITS.MAX_EVENTS_PER_SUBJECT} eventos para esta matéria no plano Free.` 
                  : `Você atingiu o limite de ${FREE_PLAN_LIMITS.MAX_GENERAL_EVENTS} eventos sem matéria no plano Free.`
                }
              </span>
              <Button 
                size="sm"
                className="mt-2 w-full sm:w-auto flex items-center gap-1 justify-center"
                onClick={() => {
                  setOpen(false);
                  router.push('/dashboard/subscription');
                }}
              >
                <CreditCard className="h-4 w-4" />
                <span>Fazer Upgrade</span>
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          typeof allEvents !== 'undefined' && 
          allEvents.length <= 1 && 
          allEvents.length > 0 && (
            <Alert variant="warning" className="my-2 border-amber-300 bg-amber-50 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-600 dark:text-amber-400">
                Você ainda pode adicionar {allEvents.length} evento no plano Free.
              </AlertDescription>
            </Alert>
          )
        )}
        
        <div className="grid gap-4 py-2 sm:py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Prova de Álgebra Linear"
              disabled={hasReachedLimit}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-studiefy-black/10 bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={hasReachedLimit}
            >
              {Object.entries(eventTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {showSubjectSelector && (
            <div className="grid gap-2">
              <Label htmlFor="subject">Matéria</Label>
              <select
                id="subject"
                value={selectedSubjectId || ""}
                onChange={(e) => setSelectedSubjectId(e.target.value === "" ? undefined : e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-studiefy-black/10 bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={hasReachedLimit}
              >
                <option value="">Evento geral (sem matéria específica)</option>
                {subjects?.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid gap-2">
            <Label>Data e Hora</Label>
            <DateTimePicker date={date} setDate={setDate} disabled={hasReachedLimit} />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || hasReachedLimit}
            className="bg-[#282828] text-white hover:bg-[#c8ff29] hover:text-[#282828]"
          >
            {loading ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
