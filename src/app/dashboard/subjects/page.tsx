"use client"

import { useState, useEffect, useRef } from "react"
import { SubjectCard } from "@/components/subject-card"
import { useSubjects } from "@/hooks/useSubjects"
import { useSetPageTitle } from "@/hooks/useSetPageTitle"
import { Loader2, PanelLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AddSubjectDialog } from "@/components/add-subject-dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function SubjectsPage() {
  const { subjects, loading, addSubject, refreshSubjects } = useSubjects()
  const router = useRouter()
  const [isAddSubjectDialogOpen, setIsAddSubjectDialogOpen] = useState(false)
  const [wasDialogOpen, setWasDialogOpen] = useState(false)

  // Define o título da página
  useSetPageTitle('Matérias')

  // Efeito para recarregar as matérias quando o diálogo for fechado após estar aberto
  useEffect(() => {
    if (wasDialogOpen && !isAddSubjectDialogOpen) {
      refreshSubjects()
      setWasDialogOpen(false)
    }

    if (isAddSubjectDialogOpen) {
      setWasDialogOpen(true)
    }
  }, [isAddSubjectDialogOpen, wasDialogOpen, refreshSubjects])

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  return (
    <div className="min-h-screen h-full p-4 space-y-4">
      {/* Botoões de navegação para mobile */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
            >
              <PanelLeft className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            {/* Conteúdo da sidebar mobile */}
          </SheetContent>
        </Sheet>
        
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => setIsAddSubjectDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Matéria</span>
        </Button>
      </div>
      
      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-studiefy-gray">
          <p>Nenhuma matéria cadastrada</p>
          <p className="text-sm">Adicione matérias clicando no botão "+" acima</p>
        </div>
      ) : (
        <div className="px-1 sm:px-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                id={subject.id}
                name={subject.name}
                color={subject.color}
              />
            ))}
          </div>
        </div>
      )}
      
      <AddSubjectDialog 
        onAddSubject={addSubject} 
        isOpenExternal={isAddSubjectDialogOpen}
        onOpenChangeExternal={setIsAddSubjectDialogOpen}
        showTriggerButton={false}
      />
    </div>
  )
}
