"use client"

import { useState, useEffect } from "react"
import { useFlashcardDecks } from "@/hooks/useFlashcardDecks"
import { useFlashcards } from "@/hooks/useFlashcards"
import { useSubjects } from "@/hooks/useSubjects"
import { useFSRS } from "@/hooks/useFSRS"
import { usePageTitle } from "@/contexts/PageTitleContext"
import { FlashcardItem } from "@/components/flashcards/flashcard-item"
import { AddFlashcardDialog } from "@/components/flashcards/add-flashcard-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, ArrowLeft, BookOpen, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { use } from "react"

interface DeckPageProps {
  params: Promise<{
    id: string
  }>
}

export default function DeckPage({ params }: DeckPageProps) {
  // Desempacotar os parâmetros usando React.use()
  const resolvedParams = use(params)
  const deckId = resolvedParams.id
  
  const router = useRouter()
  const { decks, loading: loadingDecks } = useFlashcardDecks()
  const { flashcards, loading: loadingFlashcards, updateFlashcard } = useFlashcards(deckId)
  const { subjects } = useSubjects()
  const { getDeckStats } = useFSRS()
  const { setPageTitle, setTitleElement, setTitleActions } = usePageTitle()
  
  const [deck, setDeck] = useState<any>(null)
  const [isAddFlashcardOpen, setIsAddFlashcardOpen] = useState(false)
  const [isEditFlashcardOpen, setIsEditFlashcardOpen] = useState(false)
  const [currentFlashcard, setCurrentFlashcard] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredFlashcards, setFilteredFlashcards] = useState(flashcards)
  const [stats, setStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  
  // Função para obter o nome da matéria pelo ID
  const getSubjectName = (subjectId: string | null) => {
    if (!subjectId) return null
    const subject = subjects.find(s => s.id === subjectId)
    return subject ? subject.name : null
  }

  // Busca o deck atual
  useEffect(() => {
    if (!loadingDecks) {
      const currentDeck = decks.find(d => d.id === deckId)
      setDeck(currentDeck || null)
      
      if (currentDeck) {
        // Configurar o título do deck no header global
        const subjectName = getSubjectName(currentDeck.subject_id)
        
        // Configurar o título e o emblema no header global
        setPageTitle(currentDeck.title)
        
        // Criar o elemento de título personalizado com o emblema
        setTitleElement(
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-studiefy-black">{currentDeck.title}</h1>
            {subjectName && (
              <Badge variant="outline" className="text-xs py-0 mt-1 w-fit">
                {subjectName}
              </Badge>
            )}
          </div>
        )
        
        // Configurar os botões de ação no header global
        setTitleActions(
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => router.push(`/dashboard/flashcards/${deckId}/study`)}
            >
              <BookOpen className="h-4 w-4" />
              Estudar
            </Button>
            <Button onClick={() => setIsAddFlashcardOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Flashcard
            </Button>
          </div>
        )
      }
    }
  }, [deckId, decks, loadingDecks, setPageTitle, setTitleElement, setTitleActions])
  
  // Carrega as estatísticas do deck
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true)
        const deckStats = await getDeckStats(deckId)
        setStats(deckStats)
      } catch (error) {
        console.error("Erro ao carregar estatísticas do deck:", error)
      } finally {
        setLoadingStats(false)
      }
    }
    
    if (deckId) {
      loadStats()
    }
  }, [deckId, getDeckStats])
  
  // Filtra os flashcards com base no termo de busca
  useEffect(() => {
    if (searchTerm) {
      const filtered = flashcards.filter(card => 
        card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.back.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredFlashcards(filtered)
    } else {
      setFilteredFlashcards(flashcards)
    }
  }, [flashcards, searchTerm])
  
  // Função para editar um flashcard
  const handleEditFlashcard = (id: string, front: string, back: string) => {
    setCurrentFlashcard({ id, front, back })
    setIsEditFlashcardOpen(true)
  }
  
  // Função para atualizar um flashcard
  const handleUpdateFlashcard = async (id: string, front: string, back: string) => {
    return await updateFlashcard(id, front, back)
  }
  
  if (loadingDecks || !deck) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  const subjectName = getSubjectName(deck.subject_id)
  
  return (
    <div className="space-y-6">
      {/* Botão de voltar */}
      <div className="flex flex-col space-y-2">
        <Button 
          variant="ghost" 
          className="w-fit -ml-2 -mt-2 mb-2" 
          onClick={() => router.push("/dashboard/flashcards")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Flashcards
        </Button>
        
        {/* Descrição do deck (se existir) */}
        {deck.description && (
          <p className="text-muted-foreground mt-2">
            {deck.description}
          </p>
        )}
      </div>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats?.dueToday || 0}</div>
          <div className="text-sm text-blue-600/70">Para hoje</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats?.learning || 0}</div>
          <div className="text-sm text-amber-600/70">Aprendendo</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats?.review || 0}</div>
          <div className="text-sm text-green-600/70">Em revisão</div>
        </div>
      </div>
      
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar flashcards..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Lista de flashcards */}
      {loadingFlashcards ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredFlashcards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlashcards.map((flashcard) => (
            <FlashcardItem
              key={flashcard.id}
              id={flashcard.id}
              front={flashcard.front}
              back={flashcard.back}
              deckId={deckId}
              onEditClick={handleEditFlashcard}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium mb-2">Nenhum flashcard encontrado</h3>
          <p className="text-muted-foreground mb-6">
            {flashcards.length > 0 
              ? "Nenhum flashcard corresponde à busca." 
              : "Você ainda não criou nenhum flashcard neste deck."}
          </p>
          <Button onClick={() => setIsAddFlashcardOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar meu primeiro flashcard
          </Button>
        </div>
      )}
      
      {/* Diálogo para adicionar flashcard */}
      <AddFlashcardDialog 
        deckId={deckId}
        isOpenExternal={isAddFlashcardOpen}
        onOpenChangeExternal={setIsAddFlashcardOpen}
        showTriggerButton={false}
      />
      
      {/* Diálogo para editar flashcard */}
      {currentFlashcard && (
        <AddFlashcardDialog 
          deckId={deckId}
          isOpenExternal={isEditFlashcardOpen}
          onOpenChangeExternal={setIsEditFlashcardOpen}
          showTriggerButton={false}
          editMode={true}
          flashcardId={currentFlashcard.id}
          initialFront={currentFlashcard.front}
          initialBack={currentFlashcard.back}
          onUpdate={handleUpdateFlashcard}
        />
      )}
    </div>
  )
}
