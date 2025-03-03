"use client"

import { SubjectCard } from "@/components/subject-card"
import { useSubjects } from "@/hooks/useSubjects"
import { Loader2 } from "lucide-react"

export default function SubjectsPage() {
  const { subjects, loading } = useSubjects()

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  return (
    <div className="h-full p-4 space-y-4">
      <h1 className="hidden md:block text-3xl font-bold text-studiefy-black">
        Matérias
      </h1>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-studiefy-gray">
          <p>Nenhuma matéria cadastrada</p>
          <p className="text-sm">Adicione matérias na página de Configurações</p>
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
    </div>
  )
}
