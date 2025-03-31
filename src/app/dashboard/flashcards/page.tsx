"use client"

import { useState, useEffect } from "react"
import { useFlashcardDecks } from "@/hooks/useFlashcardDecks"
import { useSubjects } from "@/hooks/useSubjects"
import { useFlashcardActivity } from "@/hooks/useFlashcardActivity"
import { useStreak } from "@/hooks/useStreak"
import { DeckCard } from "@/components/flashcards/deck-card"
import { AddDeckDialog } from "@/components/flashcards/add-deck-dialog"
import { ActivityHeatmap } from "@/components/flashcards/activity-heatmap"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Search, Info, Flame } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { usePageTitle } from "@/contexts/PageTitleContext"
import { useOnboarding } from "@/hooks/useOnboarding"
import { cn } from "@/lib/utils"

export default function FlashcardsPage() {
  const { decks, loading } = useFlashcardDecks()
  const { subjects } = useSubjects()
  const { activityData, loading: loadingActivity } = useFlashcardActivity()
  const { streak, loading: loadingStreak } = useStreak()
  const [isAddDeckOpen, setIsAddDeckOpen] = useState(false)
  const [filteredDecks, setFilteredDecks] = useState(decks)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const { setPageTitle, setTitleElement, setTitleActions } = usePageTitle()
  const { progress, markStepCompleted, loading: onboardingLoading } = useOnboarding()
  
  // Definir o título e o elemento de título no header global
  useEffect(() => {
    // Definir o título simples
    setPageTitle('Flashcards')
    
    // Definir o elemento de título personalizado com subtítulo
    setTitleElement(
      <div className="flex flex-col">  
        <h1 className="text-xl font-semibold text-studiefy-black">Flashcards</h1>
        <p className="text-muted-foreground text-sm">Crie e estude seus flashcards com repetição espacada.</p>
      </div>
    )
    
    // Definir o botão de ação no header
    setTitleActions(
      <Button onClick={() => setIsAddDeckOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Novo Deck
      </Button>
    )
    
    // Limpar ao desmontar o componente
    return () => {
      setPageTitle('')
      setTitleElement(null)
      setTitleActions(null)
    }
  }, [])
  
  // Atualiza os decks filtrados quando os decks, termo de busca ou matéria selecionada mudam
  useEffect(() => {
    let filtered = decks
    
    // Filtra por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(deck => 
        deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deck.description && deck.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Filtra por matéria
    if (selectedSubject !== "all") {
      if (selectedSubject === "none") {
        filtered = filtered.filter(deck => !deck.subject_id)
      } else {
        filtered = filtered.filter(deck => deck.subject_id === selectedSubject)
      }
    }
    
    setFilteredDecks(filtered)
  }, [decks, searchTerm, selectedSubject])
  
  // Marcar o passo de onboarding como concluído quando o usuário visitar a página
  // Comentado temporariamente até que a coluna seja adicionada no banco de dados
  /*
  useEffect(() => {
    if (!onboardingLoading && progress && !progress.visited_flashcards) {
      markStepCompleted('visited_flashcards')
    }
  }, [progress, onboardingLoading, markStepCompleted])
  */
  
  // Função para obter o nome da matéria pelo ID
  const getSubjectName = (subjectId: string | null) => {
    if (!subjectId) return null
    const subject = subjects.find(s => s.id === subjectId)
    return subject ? subject.name : null
  }
  
  // Função para obter a cor da matéria pelo ID
  const getSubjectColor = (subjectId: string | null) => {
    if (!subjectId) return null
    const subject = subjects.find(s => s.id === subjectId)
    return subject ? subject.color : null
  }
  
  return (
    <div className="space-y-6">
      {/* Mapa de calor de atividades */}
      <div className="flex justify-center">
        {loadingActivity ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <ActivityHeatmap data={activityData} className="mb-4" />
            
            {/* Exibir streak atual */}
            {!loadingStreak && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <div 
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm",
                    streak.streak > 0 
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" 
                      : "bg-zinc-100 text-zinc-600"
                  )}
                >
                  <Flame className={cn(
                    "h-4 w-4",
                    streak.streak > 0 ? "text-white" : ""
                  )} />
                  <span className="font-medium">
                    {streak.streak} {streak.streak === 1 ? 'dia' : 'dias'} consecutivos de revisão
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar decks..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject-filter">Matéria</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger id="subject-filter">
              <SelectValue placeholder="Todas as matérias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as matérias</SelectItem>
              <SelectItem value="none">Sem matéria específica</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Lista de decks */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredDecks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              subjectName={getSubjectName(deck.subject_id)}
              subjectColor={getSubjectColor(deck.subject_id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedSubject !== "all"
              ? "Nenhum deck encontrado com os filtros aplicados."
              : "Você ainda não tem nenhum deck de flashcards."}
          </p>
          {searchTerm || selectedSubject !== "all" ? (
            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setSelectedSubject("all")
            }}>
              Limpar filtros
            </Button>
          ) : (
            <Button onClick={() => setIsAddDeckOpen(true)}>
              Criar meu primeiro deck
            </Button>
          )}
        </div>
      )}
      
      {/* Diálogo para adicionar deck */}
      <AddDeckDialog
        isOpenExternal={isAddDeckOpen}
        onOpenChangeExternal={setIsAddDeckOpen}
        showTriggerButton={false}
      />
    </div>
  )
}
