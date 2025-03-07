"use client"

import { useState } from "react"
import { SubjectCard } from "@/components/subject-card"
import { useSubjects } from "@/hooks/useSubjects"
import { Loader2, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SubjectsPage() {
  const { subjects, loading } = useSubjects()
  const router = useRouter()

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  return (
    <div className="h-full p-4 space-y-4">
      {/* Header para telas médias e grandes */}
      <h1 className="hidden md:block text-3xl font-bold text-studiefy-black md:pl-12">
        Matérias
      </h1>

      {/* Header para telas pequenas */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2"
          onClick={() => router.push("/dashboard")}
        >
          <PanelLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-studiefy-black">Matérias</h1>
        <div className="w-10"></div> {/* Espaçador para centralizar o título */}
      </div>

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
