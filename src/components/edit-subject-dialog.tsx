"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useSubjects } from "@/hooks/useSubjects"
import { ColorPicker } from "./color-picker"

interface EditSubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: {
    id: string
    name: string
    color: string
  }
}

export function EditSubjectDialog({ open, onOpenChange, subject }: EditSubjectDialogProps) {
  const [loading, setLoading] = useState(false)
  const [subjectName, setSubjectName] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const { updateSubject } = useSubjects()

  useEffect(() => {
    if (open && subject) {
      setSubjectName(subject.name)
      setSelectedColor(subject.color)
    }
  }, [open, subject])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (subjectName.trim()) {
      try {
        setLoading(true)
        await updateSubject(subject.id, subjectName.trim(), selectedColor)
        toast.success("Matéria atualizada com sucesso!")
        onOpenChange(false)
      } catch (error) {
        toast.error("Erro ao atualizar matéria. Tente novamente.")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Matéria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome da Matéria</Label>
            <Input
              id="edit-name"
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
                Atualizando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
