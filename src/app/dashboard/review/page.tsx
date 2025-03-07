"use client"

import { useState, useEffect, useMemo } from "react"
import { useEvents, ErrorEntry } from "@/hooks/useEvents"
import { getAllErrorEntries, toggleErrorReviewed } from "@/hooks/useEvents"
import { useSubjects } from "@/hooks/useSubjects"
import { useSubjectCategories } from "@/hooks/useSubjectCategories"
import { useEventSources } from "@/hooks/useEventSources"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Check, CheckCircle2, X } from "lucide-react"

export default function ReviewPage() {
  const router = useRouter()
  const { subjects } = useSubjects()
  const { sources } = useEventSources()
  
  // Estados para os filtros
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all")
  const [selectedSourceId, setSelectedSourceId] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  
  // Estado para as categorias do assunto selecionado
  const [categories, setCategories] = useState<any[]>([])
  
  // Estado para todos os erros
  const [allErrors, setAllErrors] = useState<ErrorEntry[]>([])
  const [filteredErrors, setFilteredErrors] = useState<ErrorEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Separar erros revisados e não revisados
  const notReviewedErrors = useMemo(() => {
    return filteredErrors.filter(error => !error.reviewed)
  }, [filteredErrors])
  
  const reviewedErrors = useMemo(() => {
    return filteredErrors.filter(error => error.reviewed)
  }, [filteredErrors])


  // Buscar categorias quando o assunto mudar
  useEffect(() => {
    if (selectedSubjectId && selectedSubjectId !== "all") {
      const fetchCategories = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          
          if (!user) {
            throw new Error("Usuário não autenticado")
          }
          
          const { data, error } = await supabase
            .from("subject_categories")
            .select("*")
            .eq("subject_id", selectedSubjectId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
          
          if (error) {
            throw error
          }
          
          setCategories(data || [])
        } catch (error) {
          console.error("Erro ao buscar categorias:", error)
          setCategories([])
        }
      }
      
      fetchCategories()
    } else {
      setCategories([])
      setSelectedCategoryId("all")
    }
  }, [selectedSubjectId])

  // Buscar todos os erros de todos os eventos
  useEffect(() => {
    const fetchAllErrors = async () => {
      setIsLoading(true)
      try {
        const errors = await getAllErrorEntries()
        setAllErrors(errors)
        setFilteredErrors(errors)
      } catch (error) {
        console.error("Erro ao buscar erros:", error)
        setError("Erro ao buscar erros: " + (error instanceof Error ? error.message : String(error)))
        setAllErrors([])
        setFilteredErrors([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAllErrors()
  }, [])

  // Filtrar os erros quando os filtros mudarem
  useEffect(() => {
    if (allErrors.length === 0) {
      setFilteredErrors([])
      return
    }
    
    let filtered = [...allErrors]
    
    // Filtrar por assunto
    if (selectedSubjectId && selectedSubjectId !== "all") {
      filtered = filtered.filter(error => error.subject_id === selectedSubjectId)
    }
    
    // Filtrar por categoria
    if (selectedCategoryId && selectedCategoryId !== "all") {
      filtered = filtered.filter(error => error.category_id === selectedCategoryId)
    }
    
    // Filtrar por origem
    if (selectedSourceId && selectedSourceId !== "all") {
      filtered = filtered.filter(error => error.source_id === selectedSourceId)
    }
    
    // Filtrar por dificuldade
    if (selectedDifficulty && selectedDifficulty !== "all") {
      filtered = filtered.filter(error => error.difficulty === selectedDifficulty)
    }
    
    // Filtrar por texto de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(error => 
        error.question.toLowerCase().includes(query) || 
        (error.notes && error.notes.toLowerCase().includes(query))
      )
    }
    
    setFilteredErrors(filtered)
  }, [allErrors, selectedSubjectId, selectedCategoryId, selectedSourceId, selectedDifficulty, searchQuery])

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setSelectedSubjectId("all")
    setSelectedCategoryId("all")
    setSelectedSourceId("all")
    setSelectedDifficulty("all")
    setSearchQuery("")
  }

  // Função para marcar um erro como revisado/não revisado
  const handleToggleReviewed = async (errorId: string, currentStatus: boolean) => {
    try {
      await toggleErrorReviewed(errorId, !currentStatus)
      
      // Atualizar o estado local
      setAllErrors(prev => 
        prev.map(err => 
          err.id === errorId ? { ...err, reviewed: !currentStatus } : err
        )
      )
      
      toast.success(currentStatus ? "Marcado como não revisado" : "Marcado como revisado")
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast.error("Erro ao atualizar status de revisão")
    }
  }

  return (
    <div className="h-full p-4">
      {/* Header */}
      <div className="flex items-center mb-6 md:pl-12">
        <h1 className="text-2xl font-bold">Revisão</h1>
      </div>
      
      {/* Filtros */}
      <div className="mb-6">
        {/* Busca por texto */}
        <div className="mb-4">
          <Input
            id="search-query"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por texto na questão ou nas notas"
            className="w-full"
          />
        </div>
        
        <div className="flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            {/* Filtro de Matéria */}
            <div>
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
              >
                <SelectTrigger id="subject-filter" className="w-full">
                  <SelectValue placeholder="Todas as matérias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as matérias</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Filtro de Conteúdo */}
            <div>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
                disabled={!selectedSubjectId || selectedSubjectId === "all" || categories.length === 0}
              >
                <SelectTrigger id="category-filter" className="w-full">
                  <SelectValue placeholder="Todos os conteúdos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os conteúdos</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Filtro de Origem */}
            <div>
              <Select
                value={selectedSourceId}
                onValueChange={setSelectedSourceId}
              >
                <SelectTrigger id="source-filter" className="w-full">
                  <SelectValue placeholder="Todas as origens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as origens</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Filtro de Dificuldade */}
            <div>
              <Select
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}
              >
                <SelectTrigger id="difficulty-filter" className="w-full">
                  <SelectValue placeholder="Todas as dificuldades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as dificuldades</SelectItem>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                  <SelectItem value="muito_dificil">Muito Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Botão para limpar filtros */}
          {(selectedSubjectId !== "all" || selectedCategoryId !== "all" || selectedSourceId !== "all" || selectedDifficulty !== "all" || searchQuery) && (
            <div className="ml-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                size="sm"
                className="h-9 w-9 p-0 rounded-lg border border-studiefy-black/10 text-studiefy-gray hover:text-studiefy-black"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Conteúdo - Lista de erros */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filteredErrors.length > 0 ? (
          <Tabs defaultValue="not-reviewed" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="not-reviewed" className="font-medium">
                Revisão ({notReviewedErrors.length})
              </TabsTrigger>
              <TabsTrigger value="reviewed" className="font-medium">
                Revisados ({reviewedErrors.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="not-reviewed">
              <div className="space-y-4">
                {notReviewedErrors.length > 0 ? (
                  notReviewedErrors.map((errorItem) => (
                    <div 
                      key={errorItem.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          <Checkbox 
                            id={`review-${errorItem.id}`}
                            checked={!!errorItem.reviewed}
                            onCheckedChange={() => handleToggleReviewed(errorItem.id, !!errorItem.reviewed)}
                          />
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => router.push(`/dashboard/subjects/${errorItem.subject_id}/events/${errorItem.event_id}`)}>
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">
                              {subjects.find(s => s.id === errorItem.subject_id)?.name || "Matéria não especificada"}
                              {errorItem.category_id && categories.find(c => c.id === errorItem.category_id) && 
                                ` > ${categories.find(c => c.id === errorItem.category_id)?.name}`
                              }
                            </div>
                            <div className="text-sm text-gray-500">
                              {errorItem.difficulty === "facil" ? "Fácil" : 
                               errorItem.difficulty === "media" ? "Média" : 
                               errorItem.difficulty === "dificil" ? "Difícil" : 
                               errorItem.difficulty === "muito_dificil" ? "Muito Difícil" : 
                               "Dificuldade não especificada"}
                            </div>
                          </div>
                          <div className="mb-2">{errorItem.question}</div>
                          {errorItem.notes && (
                            <div className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Notas:</span> {errorItem.notes}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            Origem: {sources.find(s => s.id === errorItem.source_id)?.name || "Não especificada"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma questão para revisão com os filtros atuais.
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="reviewed">
              <div className="space-y-4">
                {reviewedErrors.length > 0 ? (
                  reviewedErrors.map((errorItem) => (
                    <div 
                      key={errorItem.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          <Checkbox 
                            id={`review-${errorItem.id}`}
                            checked={!!errorItem.reviewed}
                            onCheckedChange={() => handleToggleReviewed(errorItem.id, !!errorItem.reviewed)}
                          />
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => router.push(`/dashboard/subjects/${errorItem.subject_id}/events/${errorItem.event_id}`)}>
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">
                              {subjects.find(s => s.id === errorItem.subject_id)?.name || "Matéria não especificada"}
                              {errorItem.category_id && categories.find(c => c.id === errorItem.category_id) && 
                                ` > ${categories.find(c => c.id === errorItem.category_id)?.name}`
                              }
                            </div>
                            <div className="text-sm text-gray-500">
                              {errorItem.difficulty === "facil" ? "Fácil" : 
                               errorItem.difficulty === "media" ? "Média" : 
                               errorItem.difficulty === "dificil" ? "Difícil" : 
                               errorItem.difficulty === "muito_dificil" ? "Muito Difícil" : 
                               "Dificuldade não especificada"}
                            </div>
                          </div>
                          <div className="mb-2">{errorItem.question}</div>
                          {errorItem.notes && (
                            <div className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Notas:</span> {errorItem.notes}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            Origem: {sources.find(s => s.id === errorItem.source_id)?.name || "Não especificada"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma questão revisada com os filtros atuais.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {allErrors.length > 0 
              ? "Nenhuma questão encontrada com os filtros atuais." 
              : "Nenhuma questão adicionada ao caderno de erros ainda."}
          </div>
        )}
      </div>
    </div>
  )
}
