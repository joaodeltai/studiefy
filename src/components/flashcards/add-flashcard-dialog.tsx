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
import { Label } from "@/components/ui/label"
import { Loader2, Plus, AlertTriangle, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useFlashcards } from "@/hooks/useFlashcards"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"

interface AddFlashcardDialogProps {
  deckId: string
  onAddFlashcard?: (front: string, back: string) => Promise<any>
  isOpenExternal?: boolean;
  onOpenChangeExternal?: (open: boolean) => void;
  showTriggerButton?: boolean;
  initialFront?: string;
  initialBack?: string;
  editMode?: boolean;
  flashcardId?: string;
  onUpdate?: (id: string, front: string, back: string) => Promise<any>;
}

export function AddFlashcardDialog({ 
  deckId,
  onAddFlashcard, 
  isOpenExternal, 
  onOpenChangeExternal,
  showTriggerButton = true,
  initialFront = "",
  initialBack = "",
  editMode = false,
  flashcardId,
  onUpdate
}: AddFlashcardDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [front, setFront] = useState(initialFront)
  const [back, setBack] = useState(initialBack)
  const { addFlashcard, updateFlashcard, hasReachedLimit, remainingFlashcards } = useFlashcards(deckId)
  const router = useRouter()

  // Sincroniza o estado interno com o controle externo
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  // Atualiza os campos quando os valores iniciais mudam (para edição)
  useEffect(() => {
    setFront(initialFront);
    setBack(initialBack);
  }, [initialFront, initialBack]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChangeExternal) {
      onOpenChangeExternal(newOpen);
    }
    if (!newOpen && !editMode) {
      // Reset form
      setFront("");
      setBack("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (front.trim() && back.trim()) {
      try {
        setLoading(true)
        
        if (editMode && flashcardId && onUpdate) {
          // Modo de edição
          await onUpdate(flashcardId, front.trim(), back.trim());
          toast.success("Flashcard atualizado com sucesso!");
        } else {
          // Modo de adição
          const flashcardHandler = onAddFlashcard || addFlashcard;
          await flashcardHandler(front.trim(), back.trim());
          toast.success("Flashcard adicionado com sucesso!");
          if (!editMode) {
            setFront("");
            setBack("");
          }
        }
        
        handleOpenChange(false);
      } catch (error: any) {
        // O erro específico de limite já é tratado no hook, não precisa mostrar outro toast
        if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
          toast.error(`Erro ao ${editMode ? 'atualizar' : 'adicionar'} flashcard. Tente novamente.`)
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
            <span className="hidden sm:inline">Flashcard</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editMode ? 'Editar' : 'Adicionar'} Flashcard</DialogTitle>
          {!editMode && !hasReachedLimit && typeof remainingFlashcards === 'number' && remainingFlashcards < 10 && (
            <DialogDescription className="text-amber-500 font-medium">
              Você pode adicionar mais {remainingFlashcards} {remainingFlashcards === 1 ? 'flashcard' : 'flashcards'} neste deck no plano Free.
            </DialogDescription>
          )}
        </DialogHeader>

        {!editMode && hasReachedLimit ? (
          <div className="space-y-4">
            <Alert variant="destructive" className="border-red-500/50 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você atingiu o limite de flashcards por deck do plano Free. Faça upgrade para o plano Premium para adicionar mais flashcards.
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
              <Label htmlFor="front">Frente</Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Pergunta ou termo"
                disabled={loading}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="back">Verso</Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Resposta ou definição"
                disabled={loading}
                required
                rows={3}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={!front.trim() || !back.trim() || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editMode ? 'Atualizando...' : 'Adicionando...'}
                  </>
                ) : (
                  editMode ? 'Atualizar Flashcard' : 'Adicionar Flashcard'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
