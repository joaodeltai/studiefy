"use client"

import { useAllEvents } from "@/hooks/useAllEvents"
import { EventWithSubjectCard } from "@/components/event-with-subject-card"
import { Loader2, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo, useState, useEffect, useRef } from "react"
import { AddEventDialog } from "@/components/add-event-dialog"
import { useSubjects } from "@/hooks/useSubjects"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function AssessmentsPage() {
  const { events, loading, deleteEvent, toggleComplete, addEvent } = useAllEvents()
  const { subjects, loading: loadingSubjects } = useSubjects()
  const [showInfo, setShowInfo] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  
  const pendingEvents = useMemo(() => {
    return events.filter(event => !event.completed)
  }, [events])

  const completedEvents = useMemo(() => {
    return events.filter(event => event.completed)
  }, [events])

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

  if (loading || loadingSubjects) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  return (
    <div className="min-h-screen h-full p-4">
      <div className="flex items-center gap-3 mb-6 md:pl-12">
        <h1 className="text-2xl font-semibold text-studiefy-black">Avaliações</h1>
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full hover:bg-studiefy-black/10"
            onClick={() => setShowInfo(!showInfo)}
            ref={btnRef}
          >
            <Info className="h-4 w-4 text-studiefy-black/70 hover:text-studiefy-black" />
            <span className="sr-only">Informações sobre Avaliações</span>
          </Button>
          
          {showInfo && (
            <div 
              ref={infoRef}
              className="absolute z-50 top-full left-0 mt-2 w-72 bg-white text-studiefy-black border border-studiefy-black/10 shadow-md p-3 rounded-md text-sm animate-in fade-in-50 duration-200"
              style={{
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
              }}
            >
              <h3 className="text-base font-medium mb-1.5 text-studiefy-black">Sobre Avaliações</h3>
              <p className="text-studiefy-black/80 mb-1.5 leading-snug">
                <strong>Avaliações</strong> é onde você gerencia todas as suas provas, testes e simulados, sejam eles específicos de uma matéria ou sem matéria específica (geral).
              </p>
              <p className="font-medium mb-1 mt-2 text-studiefy-black">Como usar:</p>
              <ul className="list-disc list-inside text-studiefy-black/80 leading-snug">
                <li>Alterne entre avaliações pendentes e concluídas</li>
                <li>Adicione novas avaliações com o botão "+"</li>
                <li>Marque como concluída ao finalizar uma avaliação</li>
                <li>Clique em uma avaliação para ver seus detalhes, adicionar suas notas, total de acertos, fazer seu caderno de erros, e ver os conteúdos relacionais com o evento.</li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="ml-auto">
          <AddEventDialog 
            showSubjectSelector={true}
            onAddEvent={async (title, type, date, subjectId) => {
              try {
                // Usar a função addEvent com o parâmetro subjectId opcional
                const result = await addEvent(title, type, date, subjectId);
                // Só exibir mensagem de sucesso se o evento foi realmente adicionado
                toast.success("Evento adicionado com sucesso");
                return result;
              } catch (error: any) {
                // Não exibir toast de erro se já foi exibido pelo hook de eventos
                if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
                  toast.error("Erro ao adicionar evento");
                }
                // Propagar o erro para que o componente AddEventDialog possa tratá-lo
                throw error;
              }
            }} 
          />
        </div>
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
