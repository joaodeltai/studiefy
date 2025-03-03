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

interface AddEventSourceDialogProps {
  onAddSource: (name: string) => Promise<any>
  isOpenExternal?: boolean
  onOpenChangeExternal?: (open: boolean) => void
  showTriggerButton?: boolean
}

export function AddEventSourceDialog({ 
  onAddSource, 
  isOpenExternal,
  onOpenChangeExternal,
  showTriggerButton = true
}: AddEventSourceDialogProps) {
  const [name, setName] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const open = isOpenExternal !== undefined ? isOpenExternal : isOpen
  const setOpen = onOpenChangeExternal || setIsOpen
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Nome da origem é obrigatório")
      return
    }
    
    try {
      setIsLoading(true)
      await onAddSource(name)
      toast.success("Origem adicionada com sucesso!")
      setName("")
      setOpen(false)
    } catch (error) {
      console.error("Error adding event source:", error)
      toast.error("Erro ao adicionar origem")
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
          <DialogTitle>Adicionar Origem</DialogTitle>
          <DialogDescription>
            Crie uma nova origem para identificar a procedência dos seus eventos de estudo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da origem</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: ENEM 2022, UFRGS 2020, Simulado Cursinho"
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
