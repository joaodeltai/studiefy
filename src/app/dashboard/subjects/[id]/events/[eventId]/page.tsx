"use client"

import { useEvents } from "@/hooks/useEvents"
import { useContents } from "@/hooks/useContents"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"
import { PrioritySelector } from "@/components/priority-selector"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSubjects } from "@/hooks/useSubjects"
import { useSubjectCategories } from "@/hooks/useSubjectCategories"
import { ErrorNotebook } from "@/components/error-notebook"
import { useEventSources } from "@/hooks/useEventSources"

export default function EventPage() {
  const router = useRouter()
  const params = useParams()
  const subjectId = params?.id as string
  const eventId = params?.eventId as string

  const { events, unlinkContent, updateEventNotes, updateEventQuestions, addErrorEntry, updateErrorEntry, deleteErrorEntry } = useEvents(subjectId)
  const { contents } = useContents(subjectId)
  const { subjects } = useSubjects()
  const { categories } = useSubjectCategories(subjectId)
  const { sources } = useEventSources()

  const event = events.find(e => e.id === eventId)
  const linkedContents = contents.filter(content => 
    event?.content_ids?.includes(content.id)
  )

  const [notes, setNotes] = useState<string>('')
  const [totalQuestions, setTotalQuestions] = useState<number>(0)
  const [correctAnswers, setCorrectAnswers] = useState<number | null>(null)
  const [grade, setGrade] = useState<number | null>(null)
  const [essayGrade, setEssayGrade] = useState<number | null>(null)
  const [totalQuestionsText, setTotalQuestionsText] = useState<string>('')
  const [correctAnswersText, setCorrectAnswersText] = useState<string>('')
  const [gradeText, setGradeText] = useState<string>('')
  const [essayGradeText, setEssayGradeText] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveQuestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Carrega os valores iniciais
  useEffect(() => {
    if (event) {
      setNotes(event.notes || '')
      
      const total = event.total_questions || 0
      setTotalQuestions(total)
      setTotalQuestionsText(total > 0 ? total.toString() : '')
      
      const correct = event.correct_answers !== undefined ? event.correct_answers : null
      setCorrectAnswers(correct)
      setCorrectAnswersText(correct !== null ? correct.toString() : '')
      
      const eventGrade = event.grade !== undefined ? event.grade : null
      setGrade(eventGrade)
      setGradeText(eventGrade !== null ? eventGrade.toString() : '')
      
      const eventEssayGrade = event.essay_grade !== undefined ? event.essay_grade : null
      setEssayGrade(eventEssayGrade)
      setEssayGradeText(eventEssayGrade !== null ? eventEssayGrade.toString() : '')
    }
  }, [event])

  // Limpa os timeouts ao desmontar o componente
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (saveQuestionsTimeoutRef.current) {
        clearTimeout(saveQuestionsTimeoutRef.current)
      }
    }
  }, [])

  if (!event) {
    return null
  }

  const isQuestionType = event.type === 'prova' || event.type === 'simulado'
  const isEssayType = event.type === 'redacao'

  const handleUnlink = async (contentId: string) => {
    try {
      await unlinkContent(eventId, contentId)
      toast.success("Conteúdo desassociado com sucesso!")
    } catch (error) {
      toast.error("Erro ao desassociar conteúdo")
    }
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setNotes(newNotes)
    
    // Cancela o timeout anterior se existir
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Define um novo timeout para salvar após 1 segundo de inatividade
    setIsSaving(true)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateEventNotes(eventId, newNotes)
        setIsSaving(false)
      } catch (error) {
        console.error("Erro ao salvar anotações:", error)
        toast.error("Erro ao salvar anotações")
        setIsSaving(false)
      }
    }, 1000)
  }

  const saveQuestionValues = async () => {
    if (saveQuestionsTimeoutRef.current) {
      clearTimeout(saveQuestionsTimeoutRef.current)
    }
    
    try {
      await updateEventQuestions(eventId, totalQuestions, correctAnswers, grade, essayGrade)
    } catch (error) {
      console.error("Erro ao salvar dados de questões:", error)
      toast.error("Erro ao salvar dados de questões")
    }
  }

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setTotalQuestionsText(inputValue)
    
    // Se o campo estiver vazio, definimos o valor como zero, mas não atualizamos o texto
    if (inputValue === '') {
      setTotalQuestions(0)
      return
    }
    
    const value = parseInt(inputValue)
    if (!isNaN(value) && value >= 0) {
      setTotalQuestions(value)
    }
  }

  const handleTotalBlur = () => {
    // Ao perder o foco, atualizamos o banco de dados
    saveQuestionValues()
  }

  const handleCorrectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setCorrectAnswersText(inputValue)
    
    // Se o campo estiver vazio, definimos o valor como null, mas não atualizamos o texto
    if (inputValue === '') {
      setCorrectAnswers(null)
      return
    }
    
    const value = parseInt(inputValue)
    if (!isNaN(value) && value >= 0) {
      setCorrectAnswers(value)
    }
  }

  const handleCorrectBlur = () => {
    // Ao perder o foco, atualizamos o banco de dados
    saveQuestionValues()
  }

  const formatDecimalInput = (input: string): string => {
    // Substitui vírgula por ponto para normalizar o formato
    return input.replace(',', '.')
  }

  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setGradeText(inputValue)
    
    // Se o campo estiver vazio, definimos o valor como null
    if (inputValue === '') {
      setGrade(null)
      return
    }
    
    const normalizedValue = formatDecimalInput(inputValue)
    const value = parseFloat(normalizedValue)
    
    if (!isNaN(value) && value >= 0) {
      setGrade(value)
    }
  }

  const handleGradeBlur = () => {
    // Formata o valor para exibir com 2 casas decimais
    if (grade !== null) {
      setGradeText(grade.toFixed(2).replace('.', ','))
    }
    saveQuestionValues()
  }

  const handleEssayGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setEssayGradeText(inputValue)
    
    // Se o campo estiver vazio, definimos o valor como null
    if (inputValue === '') {
      setEssayGrade(null)
      return
    }
    
    const normalizedValue = formatDecimalInput(inputValue)
    const value = parseFloat(normalizedValue)
    
    if (!isNaN(value) && value >= 0) {
      setEssayGrade(value)
    }
  }

  const handleEssayGradeBlur = () => {
    // Formata o valor para exibir com 2 casas decimais
    if (essayGrade !== null) {
      setEssayGradeText(essayGrade.toFixed(2).replace('.', ','))
    }
    saveQuestionValues()
  }

  const handleDeleteEntry = async (errorEntryId: string) => {
    try {
      await deleteErrorEntry(errorEntryId, eventId)
      toast.success("Entrada removida com sucesso!")
    } catch (error) {
      toast.error("Erro ao remover entrada")
    }
  }

  const handleAddEntry = async (question: string, subjectId?: string, categoryId?: string, sourceId?: string, difficulty?: string, notes?: string) => {
    try {
      await addErrorEntry(eventId, question, subjectId, categoryId, sourceId, difficulty, notes)
    } catch (error) {
      toast.error("Erro ao adicionar entrada")
    }
  }

  const handleUpdateEntry = async (errorEntryId: string, updates: { question?: string; subject_id?: string; category_id?: string; source_id?: string; difficulty?: string; notes?: string }) => {
    try {
      await updateErrorEntry(errorEntryId, eventId, updates)
    } catch (error) {
      toast.error("Erro ao atualizar entrada")
    }
  }

  const formattedDate = format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-start gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-studiefy-black">{event.title}</h1>
          <p className="text-sm text-studiefy-black/70">
            {formattedDate} • {event.type}
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-6">
        <div className="w-1/2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Anotações</h2>
            {isSaving && (
              <span className="text-xs text-studiefy-black/50 italic">Salvando...</span>
            )}
          </div>
          <TextareaAutosize
            value={notes}
            onChange={handleNotesChange}
            placeholder="Adicione instruções ou anotações sobre o evento..."
            className="w-full p-3 border border-studiefy-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8ff29] min-h-[150px]"
            rows={6}
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-6 h-full">
            {isQuestionType && (
              <div className="flex flex-col justify-evenly h-full">
                <div>
                  <Label htmlFor="totalQuestions" className="text-sm font-medium block mb-2">Total</Label>
                  <Input
                    id="totalQuestions"
                    type="number"
                    min="0"
                    value={totalQuestionsText}
                    onChange={handleTotalChange}
                    onBlur={handleTotalBlur}
                    placeholder="0"
                    className="h-10 w-full text-center placeholder:text-gray-300"
                  />
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <Label htmlFor="correctAnswers" className="text-sm font-medium block">Acertos</Label>
                    {correctAnswers !== null && totalQuestions > 0 && (
                      <Badge variant="outline" className="ml-2 px-2 py-0 h-5 text-xs">
                        {Math.round((correctAnswers / totalQuestions) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="correctAnswers"
                    type="number"
                    min="0"
                    value={correctAnswersText}
                    onChange={handleCorrectChange}
                    onBlur={handleCorrectBlur}
                    placeholder="0"
                    className="h-10 w-full text-center placeholder:text-gray-300"
                  />
                </div>
              </div>
            )}
            
            <div className="flex flex-col justify-evenly h-full">
              {(isQuestionType || isEssayType) && (
                <div>
                  <Label htmlFor="grade" className="text-sm font-medium block mb-2">Nota</Label>
                  <Input
                    id="grade"
                    type="text"
                    inputMode="decimal"
                    value={gradeText}
                    onChange={handleGradeChange}
                    onBlur={handleGradeBlur}
                    placeholder="0,00"
                    className="h-10 w-full text-center placeholder:text-gray-300"
                  />
                </div>
              )}
              
              {(isQuestionType || isEssayType) && (
                <div className="mt-4">
                  <Label htmlFor="essayGrade" className="text-sm font-medium block mb-2">Nota redação</Label>
                  <Input
                    id="essayGrade"
                    type="text"
                    inputMode="decimal"
                    value={essayGradeText}
                    onChange={handleEssayGradeChange}
                    onBlur={handleEssayGradeBlur}
                    placeholder="0,00"
                    className="h-10 w-full text-center placeholder:text-gray-300"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold mb-4">Conteúdos Relacionados</h2>
        {linkedContents.length === 0 ? (
          <p className="text-studiefy-black/70">
            Nenhum conteúdo associado a este evento ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {linkedContents.map((content) => (
              <div
                key={content.id}
                className="flex items-center space-x-4 py-4 px-4 rounded-lg border border-studiefy-black/10 hover:bg-studiefy-black/5 transition-colors"
              >
                <Checkbox 
                  checked={content.completed}
                  className="ml-2"
                  disabled
                />
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => router.push(`/dashboard/subjects/${subjectId}/contents/${content.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-lg",
                      content.completed && "line-through text-studiefy-black/50"
                    )}>
                      {content.title}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-sm text-studiefy-black/70">
                    {content.due_date ? format(new Date(content.due_date), "dd/MM", { locale: ptBR }) : "--/--"}
                  </span>
                  <PrioritySelector
                    priority={content.priority}
                    disabled
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleUnlink(content.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Caderno de Erros */}
      <ErrorNotebook
        eventId={eventId}
        errorEntries={event.error_entries || []}
        subjects={subjects}
        categories={categories}
        eventSources={sources}
        isQuestionType={isQuestionType}
        onAddEntry={handleAddEntry}
        onUpdateEntry={handleUpdateEntry}
        onDeleteEntry={handleDeleteEntry}
      />
    </div>
  )
}
