"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteContentDialogProps {
  onConfirm: () => Promise<void>
}

export function DeleteContentDialog({ onConfirm }: DeleteContentDialogProps) {
  const handleDelete = async () => {
    try {
      await onConfirm()
    } catch (error) {
      console.error("Error deleting content:", error)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-studiefy-gray hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mover para a Lixeira?</AlertDialogTitle>
          <AlertDialogDescription>
            Este conteúdo será movido para a Lixeira e poderá ser restaurado posteriormente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Mover para Lixeira
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
