"use client"

import { useAllEvents } from "@/hooks/useAllEvents"
import { EventWithSubjectCard } from "@/components/event-with-subject-card"
import { Loader2, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo } from "react"
import { AddEventDialog } from "@/components/add-event-dialog"
import { useSubjects } from "@/hooks/useSubjects"

export default function AssessmentsPage() {
  const router = useRouter()
  const { events, loading, deleteEvent, toggleComplete } = useAllEvents()
  const { subjects } = useSubjects()

  // Encontrar a primeira matéria para adicionar eventos
  // Idealmente, isso seria uma seleção do usuário em um dropdown
  const firstSubject = subjects?.[0]

  const pendingEvents = useMemo(() => {
    return events.filter(event => !event.completed)
  }, [events])

  const completedEvents = useMemo(() => {
    return events.filter(event => event.completed)
  }, [events])

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
        <h1 className="text-2xl font-semibold text-studiefy-black flex-1">Avaliações</h1>
        {firstSubject && (
          <div className="ml-auto">
            <AddEventDialog onAddEvent={async (title, type, date) => {
              // Redirecionar para a página da matéria após adicionar
              const event = await firstSubject.addEvent(title, type, date)
              router.push(`/dashboard/subjects/${firstSubject.id}/events/${event.id}`)
            }} />
          </div>
        )}
      </div>

      {events.length > 0 ? (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending" className="font-medium">
              Pendentes ({pendingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="font-medium">
              Concluídas ({completedEvents.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <div className="grid gap-4">
              {pendingEvents.map((event) => (
                <EventWithSubjectCard
                  key={event.id}
                  event={event}
                  onDelete={deleteEvent}
                  onToggleComplete={toggleComplete}
                />
              ))}
              {pendingEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-400px)] text-studiefy-gray">
                  <p>Nenhuma avaliação pendente</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid gap-4">
              {completedEvents.map((event) => (
                <EventWithSubjectCard
                  key={event.id}
                  event={event}
                  onDelete={deleteEvent}
                  onToggleComplete={toggleComplete}
                />
              ))}
              {completedEvents.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-400px)] text-studiefy-gray">
                  <p>Nenhuma avaliação concluída</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] text-studiefy-gray">
          <p>Nenhuma avaliação cadastrada</p>
          <p className="text-sm">Adicione avaliações através da página de cada matéria</p>
        </div>
      )}
    </div>
  )
}
