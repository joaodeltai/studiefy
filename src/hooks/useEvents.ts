"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useXP } from "./useXP"
import { usePlanLimits, FREE_PLAN_LIMITS } from "./usePlanLimits"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export type EventType = 'prova' | 'trabalho' | 'simulado' | 'redacao'

export interface ErrorEntry {
  id: string
  event_id: string
  question: string
  subject_id?: string
  category_id?: string
  source_id?: string
  difficulty?: string
  notes?: string
  reviewed?: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  subject_id?: string
  title: string
  type: EventType
  date: string
  created_at: string
  updated_at: string
  completed: boolean
  content_ids?: string[]
  notes?: string
  total_questions?: number
  correct_answers?: number | null
  grade?: number | null
  essay_grade?: number | null
  error_entries?: ErrorEntry[]
}

export interface EventError extends Error {
  code: string;
}

export function useEvents(subjectId: string) {
  const [events, setEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { addXP, removeXP } = useXP()
  const { isPremium, hasReachedSubjectEventsLimit, remainingSubjectEvents } = usePlanLimits()

  // Fetch all events (across all subjects) to check limits
  const fetchAllEvents = async () => {
    try {
      if (!user) {
        setAllEvents([]);
        return;
      }
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id);
        
      if (error) throw error;
      setAllEvents(data || []);
    } catch (error) {
      console.error("Error fetching all events:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      if (!user || !subjectId || subjectId === "") {
        setEvents([])
        return
      }
      
      // Buscar eventos
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .match({ subject_id: subjectId })
        .order("date", { ascending: true })

      if (eventsError) throw eventsError

      // Buscar eventos de todos os assuntos para validar limites
      await fetchAllEvents();
      
      setEvents(eventsData || [])
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const addEvent = async (title: string, type: EventType, date: Date) => {
    try {
      if (!user) throw new Error("User not authenticated")

      // Verificar se o usuário atingiu o limite do plano gratuito
      if (!isPremium) {
        // Filtrar todos os eventos da matéria atual
        const subjectEvents = allEvents.filter(event => event.subject_id === subjectId)
        
        // Verificar se o usuário atingiu o limite para esta matéria
        if (hasReachedSubjectEventsLimit(subjectEvents.length)) {
          const error = new Error(`Você atingiu o limite de ${FREE_PLAN_LIMITS.MAX_EVENTS_PER_SUBJECT} eventos para esta matéria no plano Free`) as EventError;
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
      
      // Inserir o evento
      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            subject_id: subjectId,
            title,
            type,
            date: date.toISOString(),
            completed: false,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Atualizar estado com o novo evento
      setEvents((prev) => [...prev, data])
      
      // Atualizar a lista de todos os eventos para manter o controle de limites
      setAllEvents((prev) => [...prev, data]);
      
      return data
    } catch (error) {
      console.error("Error adding event:", error)
      throw error
    }
  }

  const toggleComplete = async (id: string, isComplete: boolean) => {
    try {
      const event = events.find((e) => e.id === id)
      if (!event) throw new Error(`Event not found: ${id}`)

      const newCompletedState = isComplete
      const { error } = await supabase
        .from("events")
        .update({ completed: newCompletedState })
        .match({ id: id })

      if (error) throw error

      const xpAmount = event.type === 'trabalho' 
        ? 2 
        : event.type === 'prova'
        ? 3
        : event.type === 'simulado'
        ? 5
        : 0

      if (newCompletedState) {
        await addXP(xpAmount)
      } else {
        await removeXP(xpAmount)
      }

      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, completed: newCompletedState } : e
        )
      )
    } catch (error) {
      console.error("Error toggling event completion:", error)
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
        .match({ id: id })

      if (error) throw error

      if (event.completed) {
        const xpAmount = event.type === 'trabalho' 
          ? 2 
          : event.type === 'prova'
          ? 3
          : event.type === 'simulado'
          ? 5
          : 0
        await removeXP(xpAmount)
      }

      setEvents((prev) => prev.filter((e) => e.id !== id))
      setAllEvents((prev) => prev.filter((e) => e.id !== id))
    } catch (error) {
      console.error("Error deleting event:", error)
      throw error
    }
  }

  const updateEvent = async (
    id: string,
    updates: {
      title?: string
      date?: Date
      notes?: string
      content_ids?: string[]
      total_questions?: number
      correct_answers?: number
      grade?: number
    }
  ) => {
    try {
      const event = events.find((e) => e.id === id)
      if (!event) throw new Error(`Event not found: ${id}`)

      const { error } = await supabase
        .from("events")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        )
      )
    } catch (error) {
      console.error("Error updating event:", error)
      throw error
    }
  }

  const updateEssayGrade = async (id: string, essayGrade: number) => {
    try {
      const event = events.find((e) => e.id === id)
      if (!event) throw new Error(`Event not found: ${id}`)

      const { error } = await supabase
        .from("events")
        .update({
          essay_grade: essayGrade,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, essay_grade: essayGrade } : e
        )
      )
    } catch (error) {
      console.error("Error updating essay grade:", error)
      throw error
    }
  }

  // Função para adicionar uma entrada no caderno de erros
  const addErrorEntry = async (
    eventId: string,
    question: string,
    subjectId?: string,
    categoryId?: string,
    sourceId?: string,
    difficulty?: string,
    notes?: string
  ) => {
    try {
      // Criar objeto de entrada com campos obrigatórios
      const entryData: any = {
        event_id: eventId,
        question,
      };
      
      // Adicionar campos opcionais apenas se estiverem definidos
      if (subjectId) entryData.subject_id = subjectId;
      if (categoryId) entryData.category_id = categoryId;
      if (sourceId) entryData.source_id = sourceId;
      if (difficulty) entryData.difficulty = difficulty;
      if (notes) entryData.notes = notes;
      
      const { data, error } = await supabase
        .from("error_entries")
        .insert([entryData])
        .select()
        .single()

      if (error) throw error

      // Atualizar o estado imediatamente
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                error_entries: [...(e.error_entries || []), data],
              }
            : e
        )
      )

      return data
    } catch (error) {
      console.error("Error adding error entry:", error)
      throw error
    }
  }

  // Função para atualizar uma entrada no caderno de erros
  const updateErrorEntry = async (
    errorEntryId: string,
    updates: {
      question?: string
      subject_id?: string
      category_id?: string
      source_id?: string
      difficulty?: string
      notes?: string
    }
  ) => {
    try {
      const { data, error } = await supabase
        .from("error_entries")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", errorEntryId)
        .select()
        .single()

      if (error) throw error

      // Atualizar o estado imediatamente
      setEvents((prev) =>
        prev.map((e) =>
          e.id === errorEntryId
            ? {
                ...e,
                error_entries: e.error_entries?.map((ee) =>
                  ee.id === errorEntryId ? data : ee
                ),
              }
            : e
        )
      )
      
      return data
    } catch (error) {
      console.error("Error updating error entry:", error)
      throw error
    }
  }

  // Função para deletar uma entrada no caderno de erros
  const deleteErrorEntry = async (errorEntryId: string) => {
    try {
      const { error } = await supabase
        .from("error_entries")
        .delete()
        .eq("id", errorEntryId)

      if (error) throw error

      // Atualizar o estado imediatamente
      setEvents((prev) =>
        prev.map((e) =>
          e.id === errorEntryId
            ? {
                ...e,
                error_entries: e.error_entries?.filter(
                  (ee) => ee.id !== errorEntryId
                ),
              }
            : e
        )
      )
    } catch (error) {
      console.error("Error deleting error entry:", error)
      throw error
    }
  }

  // Iniciar a busca por eventos quando o componente for montado ou o subject_id mudar
  useEffect(() => {
    if (user && subjectId) {
      fetchEvents()
    }
  }, [user, subjectId])

  // Verificar se o usuário atingiu o limite do plano gratuito
  const hasReachedLimit = !isPremium && hasReachedSubjectEventsLimit(events.length);

  // Calcular o número de eventos restantes
  const remainingEventsCount = isPremium 
    ? Infinity 
    : remainingSubjectEvents(events.length);

  return {
    events,
    allEvents,
    loading,
    hasReachedLimit,
    remainingEventsCount,
    addEvent,
    toggleComplete,
    deleteEvent,
    updateEvent,
    updateEssayGrade,
    addErrorEntry,
    updateErrorEntry,
    deleteErrorEntry,
    fetchEvents,
  }
}

// Função para buscar todos os erros de todos os eventos do usuário
export async function getAllErrorEntries() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("Usuário não autenticado")
  }
  
  try {
    // Primeiro, buscar todos os eventos do usuário
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, subject_id, title, type")
      .eq("user_id", user.id)
    
    if (eventsError) {
      throw eventsError
    }
    
    if (!events || events.length === 0) {
      return [] // Não há eventos
    }
    
    // Criar um mapa de eventos para referência rápida
    const eventsMap: Record<string, typeof events[0]> = events.reduce((acc, event) => {
      acc[event.id] = event
      return acc
    }, {} as Record<string, typeof events[0]>)
    
    // Agora buscar todos os erros relacionados a esses eventos
    const { data: errorEntries, error: entriesError } = await supabase
      .from("error_entries")
      .select("*")
      .in("event_id", events.map(event => event.id))
    
    if (entriesError) {
      throw entriesError
    }
    
    // Transformar os dados para incluir informações do evento
    const formattedEntries = errorEntries.map(entry => {
      const eventInfo = eventsMap[entry.event_id]
      return {
        ...entry,
        // Adicionar subject_id do evento se não estiver definido no erro
        subject_id: entry.subject_id || eventInfo?.subject_id
      }
    })
    
    return formattedEntries as ErrorEntry[]
  } catch (error) {
    console.error("Erro ao buscar todos os erros:", error)
    throw error
  }
}

// Função para atualizar o status de revisão de um erro
export async function toggleErrorReviewed(errorId: string, reviewed: boolean) {
  try {
    const { error } = await supabase
      .from("error_entries")
      .update({ reviewed })
      .eq("id", errorId)
    
    if (error) {
      throw error
    }
    
    return true
  } catch (error) {
    console.error("Erro ao atualizar status de revisão:", error)
    throw error
  }
}
