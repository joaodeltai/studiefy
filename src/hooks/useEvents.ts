"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useXP } from "./useXP"
import { useEffect, useState } from "react"

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
  subject_id: string
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

export function useEvents(subjectId: string) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { addXP, removeXP } = useXP()

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

      // Buscar relacionamentos event_contents
      const { data: eventContentsData, error: eventContentsError } = await supabase
        .from("event_contents")
        .select("event_id, content_id")
        .in("event_id", eventsData.map(e => e.id))

      if (eventContentsError) throw eventContentsError
      
      // Buscar entradas do caderno de erros
      const { data: errorEntriesData, error: errorEntriesError } = await supabase
        .from("error_entries")
        .select("*")
        .in("event_id", eventsData.map(e => e.id))
        
      if (errorEntriesError) throw errorEntriesError

      // Mapear content_ids e error_entries para cada evento
      const eventsWithContents = eventsData.map(event => ({
        ...event,
        content_ids: eventContentsData
          .filter(ec => ec.event_id === event.id)
          .map(ec => ec.content_id),
        error_entries: errorEntriesData
          ? errorEntriesData.filter(ee => ee.event_id === event.id)
          : []
      }))

      setEvents(eventsWithContents)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [user, subjectId])

  const addEvent = async (title: string, type: EventType, date: Date) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            subject_id: subjectId,
            title,
            type,
            date: date.toISOString(),
            completed: false,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Criar o objeto completo do evento para atualização imediata
      const newEvent: Event = { 
        ...data, 
        content_ids: [] 
      }
      
      // Atualizar o estado imediatamente
      setEvents((prev) => [...prev, newEvent])
      
      return newEvent
    } catch (error) {
      console.error("Error adding event:", error)
      throw error
    }
  }

  const deleteEvent = async (eventId: string) => {
    try {
      const event = events.find((e) => e.id === eventId)
      if (!event) throw new Error(`Event not found: ${eventId}`)

      const { error } = await supabase
        .from("events")
        .delete()
        .match({ id: eventId })

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

      setEvents((prev) => prev.filter((e) => e.id !== eventId))
    } catch (error) {
      console.error("Error deleting event:", error)
      throw error
    }
  }

  const toggleComplete = async (eventId: string) => {
    try {
      const event = events.find((e) => e.id === eventId)
      if (!event) throw new Error(`Event not found: ${eventId}`)

      const newCompletedState = !event.completed
      const { error } = await supabase
        .from("events")
        .update({ completed: newCompletedState })
        .match({ id: eventId })

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
          e.id === eventId ? { ...e, completed: newCompletedState } : e
        )
      )
    } catch (error) {
      console.error("Error toggling event completion:", error)
      throw error
    }
  }

  const linkContent = async (eventId: string, contentId: string) => {
    try {
      const { error } = await supabase
        .from("event_contents")
        .insert([{ event_id: eventId, content_id: contentId }])

      if (error) throw error

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, content_ids: [...(e.content_ids || []), contentId] }
            : e
        )
      )
    } catch (error) {
      console.error("Error linking content to event:", error)
      throw error
    }
  }

  const unlinkContent = async (eventId: string, contentId: string) => {
    try {
      const { error } = await supabase
        .from("event_contents")
        .delete()
        .match({ event_id: eventId, content_id: contentId })

      if (error) throw error

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, content_ids: e.content_ids?.filter(id => id !== contentId) || [] }
            : e
        )
      )
    } catch (error) {
      console.error("Error unlinking content from event:", error)
      throw error
    }
  }

  const updateEventNotes = async (eventId: string, notes: string) => {
    try {
      const event = events.find((e) => e.id === eventId)
      if (!event) throw new Error(`Event not found: ${eventId}`)

      const { error } = await supabase
        .from("events")
        .update({ 
          notes,
          updated_at: new Date().toISOString()
        })
        .match({ id: eventId })

      if (error) throw error

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, notes } : e
        )
      )
    } catch (error) {
      console.error("Error updating event notes:", error)
      throw error
    }
  }

  const updateEventQuestions = async (
    eventId: string,
    totalQuestions?: number,
    correctAnswers?: number | null,
    grade?: number | null,
    essayGrade?: number | null
  ) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          grade: grade,
          essay_grade: essayGrade,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)

      if (error) throw error
      
      // Atualiza o estado local
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? {
                ...event,
                total_questions: totalQuestions,
                correct_answers: correctAnswers,
                grade: grade,
                essay_grade: essayGrade,
                updated_at: new Date().toISOString(),
              }
            : event
        )
      )

      return { success: true }
    } catch (error) {
      console.error("Erro ao atualizar questões do evento:", error)
      return { success: false, error }
    }
  }
  const addErrorEntry = async (eventId: string, question: string, subjectId?: string, categoryId?: string, sourceId?: string, difficulty?: string, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from("error_entries")
        .insert([
          {
            event_id: eventId,
            question,
            subject_id: subjectId,
            category_id: categoryId,
            source_id: sourceId,
            difficulty,
            notes,
          },
        ])
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

  const updateErrorEntry = async (
    errorEntryId: string,
    eventId: string,
    updates: { question?: string; subject_id?: string; category_id?: string; source_id?: string; difficulty?: string; notes?: string }
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
          e.id === eventId
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

  const deleteErrorEntry = async (errorEntryId: string, eventId: string) => {
    try {
      const { error } = await supabase
        .from("error_entries")
        .delete()
        .eq("id", errorEntryId)

      if (error) throw error

      // Atualizar o estado imediatamente
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
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

  const toggleErrorReviewed = async (errorId: string, reviewed: boolean) => {
    try {
      const { error } = await supabase
        .from("error_entries")
        .update({ reviewed })
        .eq("id", errorId)
      
      if (error) {
        throw error
      }
      
      // Atualizar o estado local
      setEvents((prev) =>
        prev.map((e) => ({
          ...e,
          error_entries: e.error_entries?.map((ee) =>
            ee.id === errorId ? { ...ee, reviewed } : ee
          )
        }))
      )
      
      return true
    } catch (error) {
      console.error("Erro ao atualizar status de revisão:", error)
      throw error
    }
  }

  return {
    events,
    loading,
    fetchEvents,
    addEvent,
    deleteEvent,
    toggleComplete,
    linkContent,
    unlinkContent,
    updateEventNotes,
    updateEventQuestions,
    addErrorEntry,
    updateErrorEntry,
    deleteErrorEntry,
    toggleErrorReviewed
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
    // Nota: events não tem user_id diretamente, precisamos buscar todos os eventos
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, subject_id, title, type")
    
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
