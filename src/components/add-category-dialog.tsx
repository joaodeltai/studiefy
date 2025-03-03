"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AddCategoryDialogProps {
  onAddCategory: (name: string) => Promise<any>
  subjectId: string | null
  isOpenExternal?: boolean
  onOpenChangeExternal?: (open: boolean) => void
  showTriggerButton?: boolean
}

export function AddCategoryDialog({ 
  onAddCategory, 
  subjectId,
  isOpenExternal,
  onOpenChangeExternal,
  showTriggerButton = true
}: AddCategoryDialogProps) {
  const [name, setName] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const open = isOpenExternal !== undefined ? isOpenExternal : isOpen
  const setOpen = onOpenChangeExternal || setIsOpen
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Nome da categoria é obrigatório")
      return
    }
    
    if (!subjectId) {
      toast.error("Selecione uma matéria primeiro")
      setOpen(false)
      return
    }
    
    try {
      setIsLoading(true)
      await onAddCategory(name)
      toast.success("Categoria adicionada com sucesso!")
      setName("")
      setOpen(false)
    } catch (error) {
      console.error("Error adding category:", error)
      toast.error("Erro ao adicionar categoria")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTriggerButton && (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Categoria</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para organizar os conteúdos de estudo desta matéria.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da categoria</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Álgebra, Geometria, etc."
                disabled={isLoading || !subjectId}
                autoFocus
              />
              {!subjectId && (
                <p className="text-sm text-red-500">
                  Selecione uma matéria primeiro para adicionar categorias.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isLoading || !name.trim() || !subjectId}
            >
              {isLoading ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
