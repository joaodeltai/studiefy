"use client"

import { useAllContents } from "@/hooks/useAllContents"
import { ContentWithSubjectCard } from "@/components/content-with-subject-card"
import { ContentFilters } from "@/components/content-filters"
import { Loader2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

export default function StudyPage() {
  const [localCategoryId, setLocalCategoryId] = useState<string | null>(null)
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

  // Remover log para evitar possíveis problemas
  // useEffect(() => {
  //   if (!loading) {
  //     console.log("Conteúdos filtrados:", contents);
  //   }
  // }, [contents, loading]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  return (
    <div className="h-full p-4">
      <div className="flex items-center gap-3 mb-6 md:pl-12">
        <h1 className="text-2xl font-semibold text-studiefy-black">Estudo</h1>
      </div>

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
