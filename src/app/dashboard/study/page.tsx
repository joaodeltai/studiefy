"use client"

import { useAllContents } from "@/hooks/useAllContents"
import { ContentWithSubjectCard } from "@/components/content-with-subject-card"
import { ContentFilters } from "@/components/content-filters"
import { Loader2, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function StudyPage() {
  const router = useRouter()
  const [categoryId, setCategoryId] = useState<string | null>(null)
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

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  return (
    <div className="h-full p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-semibold text-studiefy-black">Estudo</h1>
      </div>

      <div className="space-y-4">
        <ContentFilters
          subjectId=""
          categoryId={categoryId}
          startDate={filters.startDate}
          endDate={filters.endDate}
          priority={filters.priority}
          selectedTags={filters.tags}
          availableTags={availableTags}
          onStartDateChange={(date) => updateFilters({ startDate: date })}
          onEndDateChange={(date) => updateFilters({ endDate: date })}
          onPriorityChange={(priority) => updateFilters({ priority })}
          onTagsChange={(tags) => updateFilters({ tags })}
          onCategoryChange={(newCategoryId) => setCategoryId(newCategoryId)}
          onClearFilters={() => {
            updateFilters({
              startDate: null,
              endDate: null,
              priority: 'all',
              tags: []
            });
            setCategoryId(null);
          }}
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
