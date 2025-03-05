"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Trash2 } from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect, Option } from "@/components/ui/multi-select"
import { ErrorEntry } from "@/hooks/useEvents"
import { Subject } from "@/hooks/useSubjects"
import { SubjectCategory } from "@/hooks/useSubjectCategories"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { EventSource } from "@/hooks/useEventSources"

interface ErrorNotebookProps {
  eventId: string
  errorEntries: ErrorEntry[]
  subjects: Subject[]
  categories: SubjectCategory[]
  eventSources?: EventSource[]
  isQuestionType: boolean
  isGeneralEvent?: boolean
  onAddEntry: (
    question: string, 
    subjectId?: string, 
    categoryId?: string, 
    sourceId?: string, 
    difficulty?: string,
    notes?: string
  ) => Promise<void>
  onUpdateEntry: (
    errorEntryId: string, 
    updates: { 
      question?: string; 
      subject_id?: string; 
      category_id?: string; 
      source_id?: string;
      difficulty?: string;
      notes?: string;
    }
  ) => Promise<void>
  onDeleteEntry: (errorEntryId: string) => Promise<void>
}

export function ErrorNotebook({
  eventId,
  errorEntries,
  subjects,
  categories,
  eventSources = [],
  isQuestionType,
  isGeneralEvent = false,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry
}: ErrorNotebookProps) {
  const [editingEntry, setEditingEntry] = useState<ErrorEntry | null>(null)
  const [newQuestion, setNewQuestion] = useState("")
  const [newSubjectId, setNewSubjectId] = useState<string | null>("none")
  const [newCategoryId, setNewCategoryId] = useState<string | null>("none")
  const [newSourceId, setNewSourceId] = useState<string | null>("none")
  const [newDifficulty, setNewDifficulty] = useState<string | null>("none")
  const [newNotes, setNewNotes] = useState<string | null>("")
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])
  const [isAddingNewEntry, setIsAddingNewEntry] = useState(false)

  // Filtra as categorias com base na matéria selecionada
  useEffect(() => {
    if (newSubjectId && newSubjectId !== "none") {
      setFilteredCategories(categories.filter(c => c.subject_id === newSubjectId))
    } else {
      setFilteredCategories([])
    }
  }, [newSubjectId, categories])

  const handleAddEntry = async () => {
    if (!newQuestion.trim()) return

    try {
      let subjectIdToUse = newSubjectId;
      
      // Para eventos gerais, precisamos ter certeza que temos um subject_id válido
      if (isGeneralEvent) {
        if (newSubjectId === "none" || !newSubjectId) {
          // Se não há matéria selecionada, usamos a primeira matéria disponível
          if (subjects.length > 0) {
            subjectIdToUse = subjects[0].id;
          } else {
            // Se não há matérias disponíveis, exibimos um erro
            console.error("No subject available for error entry");
            alert("Por favor, selecione uma matéria para adicionar a questão.");
            return;
          }
        }
      }
      
      await onAddEntry(
        newQuestion, 
        subjectIdToUse === "none" ? undefined : subjectIdToUse, 
        newCategoryId === "none" ? undefined : newCategoryId, 
        newSourceId === "none" ? undefined : newSourceId, 
        newDifficulty === "none" ? undefined : newDifficulty, 
        newNotes
      )
      
      // Resetar o formulário
      resetForm()
    } catch (error) {
      console.error("Error adding entry:", error)
    }
  }

  const handleUpdateQuestion = (id: string, question: string) => {
    onUpdateEntry(id, { question })
  }

  const handleUpdateSubject = (id: string, subjectId: string) => {
    onUpdateEntry(id, { subject_id: subjectId, category_id: "none" })
  }

  const handleUpdateCategory = (id: string, categoryId: string) => {
    onUpdateEntry(id, { category_id: categoryId })
  }

  const handleUpdateSource = (id: string, sourceId: string) => {
    onUpdateEntry(id, { source_id: sourceId })
  }

  const handleUpdateDifficulty = (id: string, difficulty: string) => {
    onUpdateEntry(id, { difficulty })
  }

  const handleUpdateNotes = (id: string, notes: string) => {
    onUpdateEntry(id, { notes })
  }

  const handleDeleteEntry = (id: string) => {
    onDeleteEntry(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddEntry()
    }
  }

  const cleanInputStyle = "border-0 shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-8 py-1"
  const cleanSelectTriggerStyle = "border-0 shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-8 py-1 min-h-0"
  
  const resetForm = () => {
    setNewQuestion("")
    setNewSubjectId("none")
    setNewCategoryId("none")
    setNewSourceId("none")
    setNewDifficulty("none")
    setNewNotes("")
    setEditingEntry(null)
  }

  const handleEdit = (entry: ErrorEntry) => {
    setEditingEntry(entry)
    setNewQuestion(entry.question)
    setNewSubjectId(entry.subject_id || "none")
    setNewCategoryId(entry.category_id || "none")
    setNewSourceId(entry.source_id || "none")
    setNewDifficulty(entry.difficulty || "none")
    setNewNotes(entry.notes || "")
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Caderno de Erros</h2>
      
      <div className="relative">
        <div className="w-full overflow-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx global>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="min-w-[800px]">
            <table className="w-full border-collapse border-none">
              <thead>
                <tr className="border-b border-studiefy-black/10">
                  <th className="w-[25%] font-medium py-2 h-9 pl-0 text-left">Questão</th>
                  <th className="w-[15%] font-medium py-2 h-9 text-left">Matéria</th>
                  <th className="w-[15%] font-medium py-2 h-9 text-left">Conteúdo</th>
                  <th className="w-[15%] font-medium py-2 h-9 text-left">Origem</th>
                  <th className="w-[15%] font-medium py-2 h-9 text-left">Dificuldade</th>
                  <th className="w-[15%] font-medium py-2 h-9 text-left">Notas</th>
                  <th className="w-[0%] pr-0"></th>
                </tr>
              </thead>
              <tbody>
                {/* Entradas existentes */}
                {errorEntries.map((entry, index) => {
                  const entrySubject = subjects.find(s => s.id === entry.subject_id)
                  const subjectCategories = categories.filter(c => c.subject_id === entry.subject_id)
                  const entryCategory = categories.find(c => c.id === entry.category_id)
                  const entrySource = eventSources.find(s => s.id === entry.source_id)
                  
                  return (
                    <tr 
                      key={entry.id} 
                      className={cn(
                        "group relative hover:bg-studiefy-black/5",
                        index !== errorEntries.length - 1 && "border-b border-studiefy-black/10"
                      )}
                    >
                      <td className="py-2 pl-0">
                        <Input
                          value={entry.question}
                          onChange={(e) => handleUpdateQuestion(entry.id, e.target.value)}
                          className={cleanInputStyle}
                        />
                      </td>
                      <td className="py-2">
                        <Select
                          value={entry.subject_id || 'none'}
                          onValueChange={(value) => handleUpdateSubject(entry.id, value)}
                        >
                          <SelectTrigger className={cleanSelectTriggerStyle}>
                            <SelectValue placeholder="Selecione a matéria">
                              {entrySubject?.name}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Selecione a matéria</SelectItem>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2">
                        <Select
                          value={entry.category_id || 'none'}
                          onValueChange={(value) => handleUpdateCategory(entry.id, value)}
                          disabled={!entry.subject_id || subjectCategories.length === 0}
                        >
                          <SelectTrigger className={cleanSelectTriggerStyle}>
                            <SelectValue placeholder="Selecione o conteúdo">
                              {entryCategory?.name}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Selecione o conteúdo</SelectItem>
                            {subjectCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2">
                        <Select
                          value={entry.source_id || 'none'}
                          onValueChange={(value) => handleUpdateSource(entry.id, value)}
                        >
                          <SelectTrigger className={cleanSelectTriggerStyle}>
                            <SelectValue placeholder="Selecione a origem">
                              {entrySource?.name}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Selecione a origem</SelectItem>
                            {eventSources.map((source) => (
                              <SelectItem key={source.id} value={source.id}>
                                {source.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2">
                        <Select
                          value={entry.difficulty || 'none'}
                          onValueChange={(value) => handleUpdateDifficulty(entry.id, value)}
                        >
                          <SelectTrigger className={cleanSelectTriggerStyle}>
                            <SelectValue placeholder="Selecione a dificuldade">
                              {entry.difficulty === 'facil' ? 'Fácil' : entry.difficulty === 'media' ? 'Média' : entry.difficulty === 'dificil' ? 'Difícil' : entry.difficulty === 'muito_dificil' ? 'Muito Difícil' : ''}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Selecione a dificuldade</SelectItem>
                            <SelectItem value="facil">Fácil</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="dificil">Difícil</SelectItem>
                            <SelectItem value="muito_dificil">Muito Difícil</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2">
                        <Input
                          value={entry.notes || ''}
                          onChange={(e) => handleUpdateNotes(entry.id, e.target.value)}
                          className={cleanInputStyle}
                        />
                      </td>
                      {/* Ícone de lixeira */}
                      <td className="w-0 p-0 pr-0 relative">
                        <div className="absolute right-[-20px] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                
                {/* Linha vazia se não houver entradas */}
                {errorEntries.length === 0 && !isAddingNewEntry && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-studiefy-black/50">
                      Nenhuma questão adicionada ao caderno de erros.
                    </td>
                  </tr>
                )}
                
                {/* Formulário para adicionar nova entrada */}
                {isAddingNewEntry && (
                  <tr className="border-b border-studiefy-black/10">
                    <td className="py-2 pl-0">
                      <Input
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Digite a questão"
                        className={cleanInputStyle}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                    </td>
                    <td className="py-2">
                      <Select value={newSubjectId} onValueChange={setNewSubjectId}>
                        <SelectTrigger className={cleanSelectTriggerStyle}>
                          <SelectValue placeholder="Selecione a matéria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Selecione a matéria</SelectItem>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2">
                      <Select 
                        value={newCategoryId} 
                        onValueChange={setNewCategoryId}
                        disabled={!newSubjectId || filteredCategories.length === 0}
                      >
                        <SelectTrigger className={cleanSelectTriggerStyle}>
                          <SelectValue placeholder="Selecione o conteúdo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Selecione o conteúdo</SelectItem>
                          {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2">
                      <Select value={newSourceId} onValueChange={setNewSourceId}>
                        <SelectTrigger className={cleanSelectTriggerStyle}>
                          <SelectValue placeholder="Selecione a origem" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Selecione a origem</SelectItem>
                          {eventSources.map((source) => (
                            <SelectItem key={source.id} value={source.id}>
                              {source.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2">
                      <Select value={newDifficulty} onValueChange={setNewDifficulty}>
                        <SelectTrigger className={cleanSelectTriggerStyle}>
                          <SelectValue placeholder="Selecione a dificuldade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Selecione a dificuldade</SelectItem>
                          <SelectItem value="facil">Fácil</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="dificil">Difícil</SelectItem>
                          <SelectItem value="muito_dificil">Muito Difícil</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2">
                      <Input
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        placeholder="Digite as notas"
                        className={cleanInputStyle}
                      />
                    </td>
                    <td className="w-0 p-0 pr-0"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Botão para adicionar nova entrada */}
        {isQuestionType && !isAddingNewEntry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingNewEntry(true)}
            className="mt-4 text-studiefy-black/70 hover:text-studiefy-black"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar questão
          </Button>
        )}
        
        {/* Botões de ação para nova entrada */}
        {isAddingNewEntry && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="default"
              size="sm"
              onClick={handleAddEntry}
              disabled={!newQuestion.trim()}
            >
              Adicionar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddingNewEntry(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
