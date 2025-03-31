"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Loader2, RotateCcw, ArrowLeft, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFlashcards } from "@/hooks/useFlashcards"
import { useFSRS } from "@/hooks/useFSRS"
import { FlashcardItem } from "./flashcard-item"
import { ReviewButtons } from "./review-buttons"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface StudySessionProps {
  deckId: string
}

export function StudySession({ deckId }: StudySessionProps) {
  const router = useRouter()
  const { flashcards, loading: loadingFlashcards } = useFlashcards(deckId)
  const { getDueFlashcards, recordReview, loading: loadingFSRS } = useFSRS()
  
  const [dueFlashcards, setDueFlashcards] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [lastReviewResult, setLastReviewResult] = useState<any>(null)
  
  useEffect(() => {
    const loadDueFlashcards = async () => {
      try {
        setIsLoading(true)
        const due = await getDueFlashcards(deckId)
        setDueFlashcards(due)
      } catch (error) {
        console.error("Erro ao carregar flashcards para revisão:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDueFlashcards()
  }, [deckId, getDueFlashcards])
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }
  
  const handleRating = async (rating: 1 | 2 | 3 | 4) => {
    if (currentIndex >= dueFlashcards.length) return
    
    const currentFlashcard = dueFlashcards[currentIndex]
    
    try {
      setIsLoading(true)
      const result = await recordReview(currentFlashcard.id, rating)
      setLastReviewResult(result)
      
      // Avança para o próximo flashcard
      if (currentIndex + 1 < dueFlashcards.length) {
        setCurrentIndex(currentIndex + 1)
        setIsFlipped(false)
      } else {
        setSessionComplete(true)
      }
    } catch (error) {
      console.error("Erro ao registrar revisão:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleRestart = () => {
    router.refresh()
    setCurrentIndex(0)
    setIsFlipped(false)
    setSessionComplete(false)
    setLastReviewResult(null)
  }
  
  const handleBack = () => {
    router.push(`/dashboard/flashcards/${deckId}`)
  }
  
  if (isLoading || loadingFlashcards || loadingFSRS) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/50 mb-4" />
        <p className="text-studiefy-black/70">Carregando flashcards...</p>
      </div>
    )
  }
  
  if (dueFlashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Nenhum flashcard para revisar hoje!</h3>
        <p className="text-studiefy-black/70 mb-6">Todos os seus flashcards estão em dia. Volte amanhã para novas revisões.</p>
        <Button onClick={handleBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o deck
        </Button>
      </div>
    )
  }
  
  if (sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Sessão de estudo concluída!</h3>
        <p className="text-studiefy-black/70 mb-6">Você revisou todos os {dueFlashcards.length} flashcards programados para hoje.</p>
        <div className="flex gap-4">
          <Button onClick={handleRestart} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </Button>
          <Button onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o deck
          </Button>
        </div>
      </div>
    )
  }
  
  const currentFlashcard = dueFlashcards[currentIndex]
  
  return (
    <div className="space-y-6">
      {/* Progresso */}
      <div className="flex justify-between items-center text-sm text-studiefy-black/70">
        <div>
          Flashcard {currentIndex + 1} de {dueFlashcards.length}
        </div>
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
      
      {/* Flashcard atual */}
      <div className="relative">
        <div 
          className={cn(
            "transition-opacity duration-300",
            isFlipped ? "opacity-0 absolute inset-0" : "opacity-100"
          )}
        >
          <Card className="cursor-pointer" onClick={handleFlip}>
            <CardContent className="p-6">
              <div className="absolute top-2 right-2 text-xs font-medium text-studiefy-black/50">
                Frente
              </div>
              <div className="min-h-[200px] flex items-center justify-center py-4">
                <div className="prose prose-sm max-w-none text-center">
                  {currentFlashcard.front.split("\n").map((line: string, i: number) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div 
          className={cn(
            "transition-opacity duration-300",
            isFlipped ? "opacity-100" : "opacity-0 absolute inset-0"
          )}
        >
          <Card className="cursor-pointer bg-indigo-50" onClick={handleFlip}>
            <CardContent className="p-6">
              <div className="absolute top-2 right-2 text-xs font-medium text-studiefy-black/50">
                Verso
              </div>
              <div className="min-h-[200px] flex items-center justify-center py-4">
                <div className="prose prose-sm max-w-none text-center">
                  {currentFlashcard.back.split("\n").map((line: string, i: number) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Botões de avaliação */}
      {isFlipped && (
        <div className="pt-4">
          <ReviewButtons onRating={handleRating} />
          
          {lastReviewResult && (
            <div className="mt-4 text-sm text-studiefy-black/70 text-center">
              Última revisão: Próxima em {format(new Date(lastReviewResult.nextDueDate), "dd 'de' MMMM", { locale: ptBR })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
