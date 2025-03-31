"use client"

import { useState, useEffect } from "react"
import { useFlashcardDecks } from "@/hooks/useFlashcardDecks"
import { StudySession } from "@/components/flashcards/study-session"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { use } from "react"

interface StudyPageProps {
  params: Promise<{
    id: string
  }>
}

export default function StudyPage({ params }: StudyPageProps) {
  // Desempacotar os parâmetros usando React.use()
  const resolvedParams = use(params)
  const deckId = resolvedParams.id
  
  const router = useRouter()
  const { decks, loading } = useFlashcardDecks()
  
  const [deck, setDeck] = useState<any>(null)
  
  // Busca o deck atual
  useEffect(() => {
    if (!loading) {
      const currentDeck = decks.find(d => d.id === deckId)
      setDeck(currentDeck || null)
    }
  }, [deckId, decks, loading])
  
  if (loading || !deck) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col space-y-2">
        <Button 
          variant="ghost" 
          className="w-fit -ml-2 -mt-2 mb-2" 
          onClick={() => router.push(`/dashboard/flashcards/${deckId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o deck
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estudar: {deck.title}</h1>
          <p className="text-muted-foreground">
            Revise seus flashcards com repetição espaçada.
          </p>
        </div>
      </div>
      
      {/* Sessão de estudo */}
      <StudySession deckId={deckId} />
    </div>
  )
}
