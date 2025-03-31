"use client"

import { useParams, useRouter } from "next/navigation"
import { usePageTitle } from "@/contexts/PageTitleContext"
import { useEffect } from "react"
import { useEvent } from "@/hooks/useEvent"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useSubjects } from "@/hooks/useSubjects"

export default function EventLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.eventId as string
  const subjectId = params?.id as string
  const { event } = useEvent(eventId)
  const { subjects } = useSubjects()
  const { setPageTitle, setTitleElement, setTitleActions } = usePageTitle()
  
  useEffect(() => {
    if (event) {
      setPageTitle(event.title)
      
      // Formatar a data
      const formattedDate = format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      
      // Encontrar a matéria para obter a cor
      const subject = subjects?.find(s => s.id === event.subject_id)
      const subjectColor = subject?.color || "#FF5733"
      
      // Criar o elemento de título personalizado com a cor da matéria
      setTitleElement(
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-6 rounded-full" 
              style={{ backgroundColor: subjectColor }}
            />
            <h1 className="text-2xl font-semibold text-studiefy-black">{event.title}</h1>
          </div>
          <p className="text-sm text-studiefy-black/70 mt-1">
            {formattedDate} • {event.type}
          </p>
        </div>
      )
      
      // Remover o botão de voltar
      setTitleActions(null)
    }
  }, [event, subjects, subjectId, router, setPageTitle, setTitleElement, setTitleActions])

  return (
    <>
      {children}
    </>
  )
}
