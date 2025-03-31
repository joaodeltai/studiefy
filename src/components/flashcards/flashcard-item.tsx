"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Pencil, Trash2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFlashcards } from "@/hooks/useFlashcards"
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

interface FlashcardItemProps {
  id: string
  front: string
  back: string
  deckId: string
  onEditClick?: (id: string, front: string, back: string) => void
  isInStudyMode?: boolean
}

export function FlashcardItem({ id, front, back, deckId, onEditClick, isInStudyMode = false }: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const { deleteFlashcard } = useFlashcards(deckId)
  
  const handleFlip = () => {
    if (isInStudyMode || !onEditClick) {
      setIsFlipped(!isFlipped)
    }
  }
  
  const handleDelete = async () => {
    try {
      await deleteFlashcard(id)
      setIsDeleteAlertOpen(false)
    } catch (error) {
      console.error("Erro ao excluir flashcard:", error)
    }
  }
  
  return (
    <>
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-500 transform",
          isInStudyMode && "cursor-pointer",
          isFlipped ? "bg-indigo-50" : "bg-white"
        )}
        onClick={handleFlip}
      >
        <CardContent className="p-4 sm:p-6">
          {/* Front/Back indicator */}
          <div className="absolute top-2 right-2 text-xs font-medium text-studiefy-black/50">
            {isFlipped ? "Verso" : "Frente"}
          </div>
          
          {/* Flip button */}
          {!isInStudyMode && (
            <div className="absolute bottom-2 right-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFlipped(!isFlipped)
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Content */}
          <div className="min-h-[120px] flex items-center justify-center py-4">
            <div className="text-center">
              {isFlipped ? (
                <div className="prose prose-sm max-w-none">
                  {back.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  {front.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          {!isInStudyMode && onEditClick && (
            <div className="absolute top-2 left-2 flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  onEditClick(id, front, back)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full text-red-500"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDeleteAlertOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta au00e7u00e3o nu00e3o pode ser desfeita. Isso excluiru00e1 permanentemente este flashcard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
