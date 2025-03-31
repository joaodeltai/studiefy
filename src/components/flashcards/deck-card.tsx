"use client"

import { useRouter } from "next/navigation"
import { Loader2, MoreVertical, Pencil, Trash2, BookOpen } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { cn } from "@/lib/utils"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu"
import { useState, useEffect } from "react"
import { useFlashcardDecks } from "@/hooks/useFlashcardDecks"
import { useFSRS } from "@/hooks/useFSRS"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { Badge } from "../ui/badge"

interface Deck {
  id: string
  title: string
  description: string | null
  subject_id?: string | null
  user_id: string
  created_at: string
  updated_at: string
  deleted: boolean
}

interface DeckCardProps {
  deck: Deck
  subjectName?: string | null
  subjectColor?: string | null
}

export function DeckCard({ deck, subjectName, subjectColor }: DeckCardProps) {
  const router = useRouter()
  const { deleteDeck } = useFlashcardDecks()
  const { getDeckStats } = useFSRS()
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Carrega as estatísticas do deck ao montar o componente
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const deckStats = await getDeckStats(deck.id)
        setStats(deckStats)
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [deck.id, getDeckStats])
  
  // Função para lidar com o clique no cartão
  const handleCardClick = () => {
    router.push(`/dashboard/flashcards/${deck.id}`)
  }
  
  // Função para lidar com o clique no botão de estudo
  const handleStudyClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Impede que o clique se propague para o cartão
    router.push(`/dashboard/flashcards/${deck.id}/study`)
  }
  
  // Função para lidar com a exclusão do deck
  const handleDelete = async () => {
    try {
      await deleteDeck(deck.id)
      setIsDeleteAlertOpen(false)
    } catch (error) {
      console.error("Erro ao excluir deck:", error)
    }
  }
  
  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer",
          subjectColor ? `hover:border-${subjectColor}-500` : "hover:border-primary"
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          {/* Cabeçalho do card com a cor da matéria */}
          <div 
            className={cn(
              "h-2",
              subjectColor ? `bg-${subjectColor}-500` : "bg-gray-300"
            )}
          />
          
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg line-clamp-1">{deck.title}</h3>
                
                {deck.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {deck.description}
                  </p>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/dashboard/flashcards/${deck.id}`)
                  }}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDeleteAlertOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Matéria associada */}
            {subjectName && (
              <Badge 
                variant="outline" 
                className={cn(
                  "font-normal",
                  subjectColor ? `bg-${subjectColor}-50 text-${subjectColor}-700 border-${subjectColor}-200` : ""
                )}
              >
                {subjectName}
              </Badge>
            )}
            
            {/* Estatísticas e botão de estudo */}
            <div className="flex justify-between items-center pt-2">
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Carregando...</span>
                </div>
              ) : stats ? (
                <div className="flex items-center space-x-4">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">{stats.total}</span> cartões
                  </div>
                  {stats.due > 0 && (
                    <div className="text-xs text-amber-600">
                      <span className="font-medium">{stats.due}</span> para revisar
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Sem estatísticas</div>
              )}
              
              <div 
                className="flex items-center text-xs text-primary hover:text-primary/80 cursor-pointer"
                onClick={handleStudyClick}
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Estudar
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir deck</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o deck "{deck.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
