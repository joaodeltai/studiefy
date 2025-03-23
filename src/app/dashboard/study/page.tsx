"use client"

import { useAllContents } from "@/hooks/useAllContents"
import { ContentWithSubjectCard } from "@/components/content-with-subject-card"
import { ContentFilters } from "@/components/content-filters"
import { Loader2, Info } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { usePageTitle } from "@/contexts/PageTitleContext"

export default function StudyPage() {
  const [localCategoryId, setLocalCategoryId] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const { setPageTitle, setTitleElement, setTitleActions } = usePageTitle()
  const {
    contents,
    loading,
    filters,
    availableTags,
    toggleComplete,
    moveToTrash,
    updatePriority,
    updateDueDate,
    updateFilters,
  } = useAllContents()

  // Definir o título da página no GlobalHeader
  useEffect(() => {
    setPageTitle('Estudo')
    
    // Botão de informações para o GlobalHeader
    setTitleActions(
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-2 h-8 w-8 rounded-full hover:bg-studiefy-black/10"
          onClick={() => setShowInfo(!showInfo)}
          ref={btnRef}
        >
          <Info className="h-4 w-4 text-studiefy-black/70 hover:text-studiefy-black" />
          <span className="sr-only">Informações sobre Estudo</span>
        </Button>
        
        {showInfo && (
          <div 
            ref={infoRef}
            className="absolute z-50 top-full left-0 mt-2 w-72 bg-white text-studiefy-black border border-studiefy-black/10 shadow-md p-3 rounded-md text-sm animate-in fade-in-50 duration-200"
            style={{
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
            }}
          >
            <h3 className="text-base font-medium mb-1.5 text-studiefy-black">Sobre Estudo</h3>
            <p className="text-studiefy-black/80 mb-1.5 leading-snug">
              <strong>Estudo</strong> é onde você encontra todos os seus conteúdos de todas as matérias em um só lugar, facilitando a organização dos seus estudos.
            </p>
            <p className="font-medium mb-1 mt-2 text-studiefy-black">Como usar:</p>
            <ul className="list-disc list-inside text-studiefy-black/80 leading-snug">
              <li>Use os filtros para encontrar conteúdos específicos</li>
              <li>Marque conteúdos como concluídos ao finalizar</li>
              <li>Organize por prioridade e data de vencimento</li>
              <li>Clique em um conteúdo para ver seus detalhes</li>
            </ul>
          </div>
        )}
      </div>
    )
    
    return () => {
      setPageTitle('')
      setTitleElement(null)
      setTitleActions(null)
    }
  }, [setPageTitle, setTitleElement, setTitleActions, showInfo])

  // Função para atualizar o categoryId e os filtros de uma só vez
  const handleCategoryChange = useCallback((newCategoryId: string | null) => {
    setLocalCategoryId(newCategoryId);
    if (typeof updateFilters === 'function') {
      updateFilters({ categoryId: newCategoryId });
    }
  }, [updateFilters]);

  // Função para limpar os filtros
  const handleClearFilters = useCallback(() => {
    if (typeof updateFilters === 'function') {
      updateFilters({
        startDate: null,
        endDate: null,
        priority: 'all',
        tags: [],
        categoryId: null
      });
    }
    setLocalCategoryId(null);
  }, [updateFilters]);

  // Handlers para os outros filtros
  const handleStartDateChange = useCallback((date: Date | null) => {
    if (typeof updateFilters === 'function') {
      updateFilters({ startDate: date });
    }
  }, [updateFilters]);

  const handleEndDateChange = useCallback((date: Date | null) => {
    if (typeof updateFilters === 'function') {
      updateFilters({ endDate: date });
    }
  }, [updateFilters]);

  const handlePriorityChange = useCallback((priority: any) => {
    if (typeof updateFilters === 'function') {
      updateFilters({ priority });
    }
  }, [updateFilters]);

  const handleTagsChange = useCallback((tags: string[]) => {
    if (typeof updateFilters === 'function') {
      updateFilters({ tags });
    }
  }, [updateFilters]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showInfo && 
          infoRef.current && 
          btnRef.current && 
          !infoRef.current.contains(event.target as Node) &&
          !btnRef.current.contains(event.target as Node)) {
        setShowInfo(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showInfo])

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  return (
    <div className="min-h-screen h-full p-4">
      <div className="space-y-4">
        <ContentFilters
          subjectId=""
          categoryId={filters.categoryId || localCategoryId}
          startDate={filters.startDate}
          endDate={filters.endDate}
          priority={filters.priority}
          selectedTags={filters.tags}
          availableTags={availableTags}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onPriorityChange={handlePriorityChange}
          onTagsChange={handleTagsChange}
          onCategoryChange={handleCategoryChange}
          onClearFilters={handleClearFilters}
        />

        {contents.length > 0 ? (
          <div className="grid gap-4">
            {contents.map((content) => (
              <ContentWithSubjectCard
                key={content.id}
                content={content}
                onToggleComplete={toggleComplete}
                onMoveToTrash={moveToTrash}
                onUpdatePriority={updatePriority}
                onUpdateDueDate={updateDueDate}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] text-studiefy-gray">
            <p>Nenhum conteúdo cadastrado</p>
            <p className="text-sm">Adicione conteúdos através da página de cada matéria</p>
          </div>
        )}
      </div>
    </div>
  )
}
