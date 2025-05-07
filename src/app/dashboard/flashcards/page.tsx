"use client"

import { useState, useEffect, useRef } from "react"
import { useFlashcardDecks } from "@/hooks/useFlashcardDecks"
import { useSubjects } from "@/hooks/useSubjects"
import { useFlashcardActivity } from "@/hooks/useFlashcardActivity"
import { useStreak } from "@/hooks/useStreak"
import { useProfile } from "@/hooks/useProfile"
import { DeckCard } from "@/components/flashcards/deck-card"
import { AddDeckDialog } from "@/components/flashcards/add-deck-dialog"
import { ActivityHeatmap } from "@/components/flashcards/activity-heatmap"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Search, Info, Flame, Calendar, Medal } from "lucide-react"
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
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function FlashcardsPage() {
  const { decks, loading } = useFlashcardDecks()
  const { subjects } = useSubjects()
  const { activityData, loading: loadingActivity } = useFlashcardActivity()
  const { streak, loading: loadingStreak } = useStreak()
  const { profile } = useProfile()
  const [isAddDeckOpen, setIsAddDeckOpen] = useState(false)
  const [filteredDecks, setFilteredDecks] = useState(decks)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const { setPageTitle, setTitleElement, setTitleActions } = usePageTitle()
  const { progress, markStepCompleted, loading: onboardingLoading } = useOnboarding()
  const [showFlashcardsInfo, setShowFlashcardsInfo] = useState(false)
  const btnFlashcardsInfoRef = useRef<HTMLButtonElement>(null)
  const flashcardsInfoRef = useRef<HTMLDivElement>(null)
  
  // Função para alternar a visibilidade do popover de informações
  const toggleFlashcardsInfo = () => {
    setShowFlashcardsInfo(prev => !prev)
  }

  // Definir o título e o elemento de título no header global
  useEffect(() => {
    // Definir o título simples
    setPageTitle('Flashcards')
    
    // Definir o elemento de título personalizado
    setTitleElement(
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium">Flashcards</span>
          <div className="relative inline-block">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white/20"
              onClick={toggleFlashcardsInfo}
              ref={btnFlashcardsInfoRef}
            >
              <Info className="h-4 w-4 text-white hover:text-white/80" />
              <span className="sr-only">Informações sobre Flashcards</span>
            </Button>
          </div>
        </div>
        
        {/* Data atual - clicável para ir para o calendário */}
        <Link href="/dashboard/calendar" className="bg-zinc-800 rounded-full pl-1 pr-4 py-1 flex items-center ml-4 hover:bg-zinc-700 transition-colors cursor-pointer">
          <div className="bg-zinc-700 w-6 h-6 rounded-full flex items-center justify-center mr-2">
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <span className="text-sm font-medium text-gray-400">
            {format(new Date(), "d MMMM", { locale: ptBR })}
          </span>
        </Link>
        
        {/* Nível do usuário */}
        <div className="flex items-center gap-1 ml-4">
          <Medal className="h-4 w-4" />
          <span className="text-sm font-medium">Nível {profile?.level || 1}</span>
        </div>
        
        {/* Ofensiva */}
        <div className="flex items-center gap-1 ml-4">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium">{streak?.streak || 0} dias</span>
        </div>
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
  
  // Fechar o popover de informações quando o usuário clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Verificar se o clique foi fora do popover de informações de flashcards
      if (
        showFlashcardsInfo && 
        flashcardsInfoRef.current && 
        btnFlashcardsInfoRef.current && 
        !flashcardsInfoRef.current.contains(event.target as Node) && 
        !btnFlashcardsInfoRef.current.contains(event.target as Node)
      ) {
        setShowFlashcardsInfo(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showFlashcardsInfo])
  
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
      {/* Popover de informações sobre flashcards */}
      {showFlashcardsInfo && (
        <div 
          ref={flashcardsInfoRef}
          className="fixed top-20 right-10 mt-2 p-4 bg-white rounded-lg shadow-lg z-[100] w-72 text-black"
        >
          <h3 className="font-semibold mb-2">Sobre os Flashcards</h3>
          <p className="text-sm text-studiefy-black/70 mb-2">
            Flashcards são cartões de estudo que ajudam na memorização através da repetição espaçada.
          </p>
          <h4 className="font-medium mt-3 mb-1">Como usar:</h4>
          <ul className="text-sm text-studiefy-black/70 list-disc pl-5 space-y-1">
            <li>Crie decks para organizar seus flashcards por assunto</li>
            <li>Adicione cartões com perguntas e respostas</li>
            <li>Estude regularmente para fixar o conteúdo</li>
          </ul>
        </div>
      )}
      
      {/* Filtros e botão de adicionar */}
      <div className="flex items-end gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search" className="mb-2 block">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar decks..."
              className="pl-9 rounded-full border-zinc-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-64">
          <Label htmlFor="subject-filter" className="mb-2 block">Matéria</Label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger id="subject-filter" className="rounded-full border-zinc-300">
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
        
        <div>
          <Button 
            onClick={() => setIsAddDeckOpen(true)} 
            variant="outline" 
            size="icon" 
            className="rounded-full h-10 w-10 border-zinc-900 hover:bg-zinc-100"
          >
            <Plus className="h-5 w-5 text-zinc-900" />
            <span className="sr-only">Adicionar deck</span>
          </Button>
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
      
      {/* Mapa de calor de atividades */}
      <div className="mt-10 px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-lg font-medium mb-4">Atividade de Revisão</h2>
          {loadingActivity ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[600px] md:min-w-0">
                  <ActivityHeatmap data={activityData} className="mb-4" />
                </div>
              </div>
              
              {/* Exibir streak atual */}
              {!loadingStreak && streak && (
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
      </div>
    </div>
  )
}
