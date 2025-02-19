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
import { useState } from "react"
import { toast } from "sonner"

const SUBJECT_COLORS = [
  "#FF5733", // Vermelho
  "#33FF57", // Verde
  "#3357FF", // Azul
  "#FF33F6", // Rosa
  "#33FFF6", // Ciano
  "#F6FF33", // Amarelo
  "#FF8333", // Laranja
  "#8333FF", // Roxo
]

interface AddSubjectDialogProps {
  onAddSubject: (name: string, color: string) => Promise<any>
}

export function AddSubjectDialog({ onAddSubject }: AddSubjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subjectName, setSubjectName] = useState("")
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (subjectName.trim()) {
      try {
        setLoading(true)
        await onAddSubject(subjectName.trim(), selectedColor)
        toast.success("Matéria adicionada com sucesso!")
        setSubjectName("")
        setSelectedColor(SUBJECT_COLORS[0])
        setOpen(false)
      } catch (error) {
        toast.error("Erro ao adicionar matéria. Tente novamente.")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
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
          <div className="space-y-2">
            <Label>Cor da Matéria</Label>
            <div className="grid grid-cols-4 gap-2">
              {SUBJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    selectedColor === color ? "border-black scale-110" : "border-transparent scale-100"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  disabled={loading}
                />
              ))}
            </div>
          </div>
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
