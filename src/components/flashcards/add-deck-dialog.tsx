"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, AlertTriangle, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useFlashcardDecks } from "@/hooks/useFlashcardDecks"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSubjects } from "@/hooks/useSubjects"

interface AddDeckDialogProps {
  onAddDeck?: (title: string, description: string | null, subjectId: string | null) => Promise<any>
  isOpenExternal?: boolean;
  onOpenChangeExternal?: (open: boolean) => void;
  showTriggerButton?: boolean;
  subjectId?: string;
}

export function AddDeckDialog({ 
  onAddDeck, 
  isOpenExternal, 
  onOpenChangeExternal,
  showTriggerButton = true,
  subjectId
}: AddDeckDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(subjectId || null)
  const { addDeck, hasReachedLimit, remainingDecks } = useFlashcardDecks()
  const { subjects } = useSubjects()
  const router = useRouter()

  // Sincroniza o estado interno com o controle externo
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  useEffect(() => {
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    }
  }, [subjectId]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChangeExternal) {
      onOpenChangeExternal(newOpen);
    }
    if (!newOpen) {
      // Reset form
      setTitle("");
      setDescription("");
      setSelectedSubjectId(subjectId || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      try {
        setLoading(true)
        const deckHandler = onAddDeck || addDeck;
        const newDeck = await deckHandler(title.trim(), description.trim() || null, selectedSubjectId)
        toast.success("Deck adicionado com sucesso!")
        setTitle("")
        setDescription("")
        handleOpenChange(false)
        return newDeck;
      } catch (error: any) {
        // O erro específico de limite já é tratado no hook, não precisa mostrar outro toast
        if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
          toast.error("Erro ao adicionar deck. Tente novamente.")
        }
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleUpgradeClick = () => {
    handleOpenChange(false)
    router.push('/dashboard/subscription')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTriggerButton && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Deck</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Deck de Flashcards</DialogTitle>
          {!hasReachedLimit && typeof remainingDecks === 'number' && remainingDecks < 5 && (
            <DialogDescription className="text-amber-500 font-medium">
              Você pode adicionar mais {remainingDecks} {remainingDecks === 1 ? 'deck' : 'decks'} no plano Free.
            </DialogDescription>
          )}
        </DialogHeader>

        {hasReachedLimit ? (
          <div className="space-y-4">
            <Alert variant="destructive" className="border-red-500/50 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você atingiu o limite de decks do plano Free. Faça upgrade para o plano Premium para adicionar mais decks.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleUpgradeClick} 
              className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              <CreditCard className="h-4 w-4" />
              Fazer upgrade para Premium
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Deck</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Verbos Irregulares em Inglês"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o conteúdo deste deck"
                disabled={loading}
                rows={3}
              />
            </div>

            {!subjectId && (
              <div className="space-y-2">
                <Label htmlFor="subject">Matéria (opcional)</Label>
                <Select 
                  value={selectedSubjectId || "none"} 
                  onValueChange={(value) => setSelectedSubjectId(value || null)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma matéria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem matéria específica</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={!title.trim() || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  "Adicionar Deck"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
