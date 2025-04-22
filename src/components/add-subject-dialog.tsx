"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, AlertTriangle, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { ColorPicker } from "./color-picker"
import { useSubjects } from "@/hooks/useSubjects"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

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
  const { hasReachedLimit, remainingSubjects } = useSubjects()
  const router = useRouter()

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
      } catch (error: any) {
        // O erro específico de limite já é tratado no hook, não precisa mostrar outro toast
        if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
          toast.error("Erro ao adicionar matéria. Tente novamente.")
        }
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleUpgradeClick = () => {
    handleOpenChange(false)
    router.push('/dashboard/subscription')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Matéria</DialogTitle>
          {!hasReachedLimit && typeof remainingSubjects === 'number' && remainingSubjects < 5 && (
            <DialogDescription className="text-amber-500 font-medium">
              Você pode adicionar mais {remainingSubjects} {remainingSubjects === 1 ? 'matéria' : 'matérias'} no plano Free.
            </DialogDescription>
          )}
        </DialogHeader>

        {hasReachedLimit ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você atingiu o limite de matérias do plano Free. Faça upgrade para o plano Premium para adicionar mais matérias.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleUpgradeClick}
              className="w-full flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Fazer Upgrade para Premium
            </Button>
          </div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  )
}
