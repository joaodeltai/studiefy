"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ColorPicker } from "./color-picker"

interface AddSubjectDialogProps {
  onAddSubject: (name: string, color: string) => Promise<any>
  isOpenExternal?: boolean;
  onOpenChangeExternal?: (open: boolean) => void;
  showTriggerButton?: boolean;
}

export function AddSubjectDialog({ 
  onAddSubject, 
  isOpenExternal, 
  onOpenChangeExternal,
  showTriggerButton = true
}: AddSubjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subjectName, setSubjectName] = useState("")
  const [selectedColor, setSelectedColor] = useState("#FF5733")

  // Sincroniza o estado interno com o controle externo
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChangeExternal) {
      onOpenChangeExternal(newOpen);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (subjectName.trim()) {
      try {
        setLoading(true)
        await onAddSubject(subjectName.trim(), selectedColor)
        toast.success("Matéria adicionada com sucesso!")
        setSubjectName("")
        setSelectedColor("#FF5733")
        handleOpenChange(false)
      } catch (error) {
        toast.error("Erro ao adicionar matéria. Tente novamente.")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTriggerButton && (
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#282828] hover:bg-[#c8ff29] hover:text-[#282828] transition-colors"
          >
            <Plus className="h-6 w-6 text-[#f5f3f5]" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Matéria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Matéria</Label>
            <Input
              id="name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Ex: Matemática"
              disabled={loading}
            />
          </div>
          
          <ColorPicker 
            color={selectedColor}
            onChange={setSelectedColor}
            label="Cor da Matéria"
            disabled={loading}
          />
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adicionando...
              </>
            ) : (
              "Adicionar Matéria"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
