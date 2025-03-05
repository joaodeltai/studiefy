"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"
import { EventType } from "./useEvents"
import { useXP } from "./useXP"
import { usePlanLimits, FREE_PLAN_LIMITS } from "./usePlanLimits"
import { toast } from "sonner"

export interface EventWithSubject {
  id: string
  subject_id: string | null
  title: string
  type: EventType
  date: string
  completed: boolean
  created_at: string
  updated_at: string
  notes?: string
  total_questions?: number
  correct_answers?: number
  grade?: number
  essay_grade?: number
  subject: {
    name: string
    color: string
  } | null
}

// Interface para erros específicos com código
export interface EventLimitError extends Error {
  code: string;
}

export function useAllEvents() {
  const [events, setEvents] = useState<EventWithSubject[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { addXP, removeXP } = useXP()
  const { 
    isPremium, 
    hasReachedSubjectEventsLimit, 
    hasReachedGeneralEventsLimit
  } = usePlanLimits()

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          subject:subjects(name, color)
        `)
        .order("date", { ascending: true })

      if (error) {
        throw error
      }

      setEvents(data || [])
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const addEvent = async (title: string, type: EventType, date: Date, subjectId?: string) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      // Verificar limites para usuários do plano Free
      if (!isPremium) {
        if (subjectId) {
          // Contagem de eventos para esta matéria específica
          const subjectEvents = events.filter(event => event.subject_id === subjectId);
          
          if (hasReachedSubjectEventsLimit(subjectEvents.length)) {
            const error = new Error(`Você atingiu o limite de ${FREE_PLAN_LIMITS.MAX_EVENTS_PER_SUBJECT} eventos para esta matéria no plano Free.`) as EventLimitError;
            error.code = 'PLAN_LIMIT_REACHED';
            toast.error(error.message, {
              description: "Faça upgrade para adicionar mais eventos.",
              action: {
                label: "Fazer upgrade",
                onClick: () => window.location.href = "/dashboard/subscription"
              }
            });
            throw error;
          }
        } else {
          // Contagem de eventos sem matéria (eventos gerais)
          const generalEvents = events.filter(event => event.subject_id === null);
          
          if (hasReachedGeneralEventsLimit(generalEvents.length)) {
            const error = new Error(`Você atingiu o limite de ${FREE_PLAN_LIMITS.MAX_GENERAL_EVENTS} eventos sem matéria no plano Free.`) as EventLimitError;
            error.code = 'PLAN_LIMIT_REACHED';
            toast.error(error.message, {
              description: "Faça upgrade para adicionar mais eventos.",
              action: {
                label: "Fazer upgrade",
                onClick: () => window.location.href = "/dashboard/subscription"
              }
            });
            throw error;
          }
        }
      }
      
      let subjectData = null;
      
      // Verificar se a matéria existe, apenas se um subjectId foi fornecido
      if (subjectId) {
        const { data, error: subjectError } = await supabase
          .from("subjects")
          .select("name, color")
          .eq("id", subjectId)
          .single()

        if (subjectError) throw subjectError
        subjectData = data;
      }

      // Inserir o evento com o user_id
      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            subject_id: subjectId || null,
            title,
            type,
            date: date.toISOString(),
            completed: false,
            user_id: user.id, // Adicionar o user_id ao criar o evento
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Formatar o novo evento para incluir o objeto subject
      const newEvent: EventWithSubject = {
        ...data,
        subject: subjectData ? {
          name: subjectData.name,
          color: subjectData.color
        } : null
      }

      // Atualizar o estado
      setEvents(prev => [...prev, newEvent])
      
      return newEvent
    } catch (error: any) {
      console.error("Error adding event:", error)
      // Não exibir o toast se já foi exibido pela verificação de limite
      if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
        toast.error("Erro ao adicionar evento");
      }
      throw error
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const event = events.find((e) => e.id === id)
      if (!event) throw new Error(`Event not found: ${id}`)

      const { error } = await supabase
        .from("events")
        .delete()
        .match({ id })

      if (error) throw error

      // Remover XP se o evento estava completo
      if (event.completed) {
        let xpAmount = 0;
        
        // Determinação do XP baseado no tipo de evento
        switch (event.type) {
          case 'trabalho':
            xpAmount = 2;
            break;
          case 'prova':
            xpAmount = 3;
            break;
          case 'simulado':
            xpAmount = 5;
            break;
          case 'redacao':
            xpAmount = 4;
            break;
          default:
            xpAmount = 0;
        }
        
        if (xpAmount > 0) {
          await removeXP(xpAmount);
        }
      }

      // Atualizar o estado
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch (error) {
      console.error("Error deleting event:", error)
      throw error
    }
  }

  const toggleComplete = async (id: string, isComplete: boolean) => {
    try {
      const event = events.find((e) => e.id === id)
      if (!event) throw new Error(`Event not found: ${id}`)

      const { error } = await supabase
        .from("events")
        .update({ completed: isComplete })
        .match({ id })

      if (error) throw error

      // Adicionar ou remover XP baseado na conclusão
      if (isComplete) {
        let xpAmount = 0;
        
        // Determinação do XP baseado no tipo de evento
        switch (event.type) {
          case 'trabalho':
            xpAmount = 2;
            break;
          case 'prova':
            xpAmount = 3;
            break;
          case 'simulado':
            xpAmount = 5;
            break;
          case 'redacao':
            xpAmount = 4;
            break;
          default:
            xpAmount = 0;
        }
        
        if (xpAmount > 0) {
          await addXP(xpAmount);
        }
      } else if (event.completed) {
        // Se estava completo e agora não está mais, remover XP
        let xpAmount = 0;
        
        // Determinação do XP baseado no tipo de evento
        switch (event.type) {
          case 'trabalho':
            xpAmount = 2;
            break;
          case 'prova':
            xpAmount = 3;
            break;
          case 'simulado':
            xpAmount = 5;
            break;
          case 'redacao':
            xpAmount = 4;
            break;
          default:
            xpAmount = 0;
        }
        
        if (xpAmount > 0) {
          await removeXP(xpAmount);
        }
      }

      // Atualizar o estado
      setEvents(prev =>
        prev.map(e =>
          e.id === id ? { ...e, completed: isComplete } : e
        )
      )
    } catch (error) {
      console.error("Error toggling event completion:", error)
      throw error
    }
  }

  return {
    events,
    loading,
    deleteEvent,
    toggleComplete,
    addEvent,
    fetchEvents
  }
}
