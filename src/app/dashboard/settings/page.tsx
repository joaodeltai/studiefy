"use client"

import { useState } from "react"
import { useSubjects } from "@/hooks/useSubjects"
import { AddSubjectDialog } from "@/components/add-subject-dialog"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { SubjectCategoriesManager } from "@/components/subject-categories-manager"
import { EventSourcesManager } from "@/components/event-sources-manager"

export default function SettingsPage() {
  const { subjects, loading, addSubject } = useSubjects()
  const [isAddSubjectDialogOpen, setIsAddSubjectDialogOpen] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  
  return (
    <div className="h-full p-4 space-y-8">
      <h1 className="text-3xl font-bold text-studiefy-black mb-8">
        Configurações
      </h1>

      <div className="max-w-2xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-studiefy-black">Gerenciar Matérias</h2>
            
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="subject-select">Matérias cadastradas</Label>
                {loading ? (
                  <div className="flex items-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-studiefy-black/70 mr-2" />
                    <span className="text-sm text-studiefy-gray">Carregando matérias...</span>
                  </div>
                ) : (
                  <Select onValueChange={(value) => setSelectedSubjectId(value)}>
                    <SelectTrigger id="subject-select" className="w-full">
                      <SelectValue placeholder="Selecione uma matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Nenhuma matéria cadastrada
                        </SelectItem>
                      ) : (
                        subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: subject.color }}
                              />
                              <span>{subject.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <Button 
                size="icon" 
                className="h-10 w-10"
                onClick={() => setIsAddSubjectDialogOpen(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            
            <p className="text-sm text-studiefy-gray">
              Adicione, remova ou edite suas matérias. As matérias cadastradas aparecerão na aba de Matérias.
            </p>
          </div>
          
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold text-studiefy-black">Categorias da Matéria</h2>
            <p className="text-sm text-studiefy-gray mb-4">
              Adicione categorias para organizar os conteúdos de estudo dentro de cada matéria. 
              Por exemplo, para Matemática, você pode criar categorias como "Álgebra", "Geometria Plana", etc.
            </p>
            
            <SubjectCategoriesManager subjectId={selectedSubjectId} />
          </div>
          
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-xl font-semibold text-studiefy-black">Origens de Eventos</h2>
            <p className="text-sm text-studiefy-gray mb-4">
              Adicione origens para identificar a procedência dos seus eventos de estudo.
              Por exemplo: "ENEM 2022", "UFRGS 2020", "Simulado Cursinho", etc.
            </p>
            
            <EventSourcesManager />
          </div>
        </div>
      </div>
      
      <AddSubjectDialog 
        onAddSubject={addSubject} 
        isOpenExternal={isAddSubjectDialogOpen}
        onOpenChangeExternal={setIsAddSubjectDialogOpen}
        showTriggerButton={false}
      />
    </div>
  )
}
