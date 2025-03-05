"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useState, useEffect } from "react"
import { EventType, ErrorEntry } from "./useEvents"
import { useXP } from "./useXP"

export interface Event {
  id: string
  subject_id: string | null
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
  subject?: {
    id: string
    name: string
    color: string
  } | null
}

export function useEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { addXP, removeXP } = useXP()

  const fetchEvent = async () => {
    try {
      setLoading(true)
      
      if (!user || !eventId) {
        setEvent(null)
        return
      }
      
      // Buscar evento com informações da matéria (se houver)
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(`
          *,
          subject:subjects(id, name, color)
        `)
        .eq("id", eventId)
        .single()

      if (eventError) throw eventError

      // Buscar relacionamentos event_contents
      const { data: eventContentsData, error: eventContentsError } = await supabase
        .from("event_contents")
        .select("event_id, content_id")
        .eq("event_id", eventId)

      if (eventContentsError) throw eventContentsError
      
      // Buscar entradas do caderno de erros
      const { data: errorEntriesData, error: errorEntriesError } = await supabase
        .from("error_entries")
        .select("*")
        .eq("event_id", eventId)
        
      if (errorEntriesError) throw errorEntriesError

      // Mapear content_ids e error_entries para o evento
      const eventWithContents = {
        ...eventData,
        content_ids: eventContentsData
          .map(ec => ec.content_id),
        error_entries: errorEntriesData || []
      }

      setEvent(eventWithContents)
    } catch (error) {
      console.error("Error fetching event:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvent()
  }, [user, eventId])

  const toggleComplete = async () => {
    if (!event) return

    try {
      const newCompletedState = !event.completed
      
      // Atualiza o estado local para feedback imediato
      setEvent(prev => prev ? { ...prev, completed: newCompletedState } : null)

      const { error } = await supabase
        .from("events")
        .update({ 
          completed: newCompletedState,
          updated_at: new Date().toISOString()
        })
        .eq("id", eventId)

      if (error) {
        // Se houver erro, reverte o estado local
        setEvent(prev => prev ? { ...prev, completed: event.completed } : null)
        throw error
      }

      // Calcula o XP baseado no tipo do evento
      const xpAmount = event.type === 'trabalho' 
        ? 2 
        : event.type === 'prova'
        ? 3
        : event.type === 'simulado'
        ? 5
        : 4 // Valor de XP para redação

      // Se o evento foi marcado como concluído, adiciona XP
      // Se foi desmarcado, remove XP
      if (newCompletedState) {
        await addXP(xpAmount)
      } else {
        await removeXP(xpAmount)
      }
    } catch (error) {
      console.error("Error toggling event completion:", error)
      throw error
    }
  }

  const updateEventNotes = async (notes: string) => {
    if (!event) return

    try {
      // Atualiza o estado local para feedback imediato
      setEvent(prev => prev ? { ...prev, notes } : null)

      const { error } = await supabase
        .from("events")
        .update({ 
          notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", eventId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating event notes:", error)
      throw error
    }
  }

  const updateEventQuestions = async (
    totalQuestions?: number,
    correctAnswers?: number | null,
    grade?: number | null,
    essayGrade?: number | null
  ) => {
    if (!event) return { success: false }

    try {
      // Atualiza o estado local
      setEvent(prev => prev ? {
        ...prev,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        grade: grade,
        essay_grade: essayGrade,
        updated_at: new Date().toISOString(),
      } : null)

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

      return { success: true }
    } catch (error) {
      console.error("Erro ao atualizar questões do evento:", error)
      return { success: false, error }
    }
  }

  const linkContent = async (contentId: string) => {
    if (!event) return

    try {
      const { error } = await supabase
        .from("event_contents")
        .insert([{ event_id: eventId, content_id: contentId }])

      if (error) throw error

      // Atualiza o estado local
      setEvent(prev => {
        if (!prev) return null
        return {
          ...prev,
          content_ids: [...(prev.content_ids || []), contentId]
        }
      })
    } catch (error) {
      console.error("Error linking content to event:", error)
      throw error
    }
  }

  const unlinkContent = async (contentId: string) => {
    if (!event) return

    try {
      const { error } = await supabase
        .from("event_contents")
        .delete()
        .match({ event_id: eventId, content_id: contentId })

      if (error) throw error

      // Atualiza o estado local
      setEvent(prev => {
        if (!prev) return null
        return {
          ...prev,
          content_ids: prev.content_ids?.filter(id => id !== contentId) || []
        }
      })
    } catch (error) {
      console.error("Error unlinking content from event:", error)
      throw error
    }
  }

  const addErrorEntry = async (question: string, subjectId?: string, categoryId?: string, sourceId?: string, difficulty?: string, notes?: string) => {
    if (!event || !user) return

    try {
      // Criar objeto de entrada com campos obrigatórios
      const entryData: any = {
        event_id: eventId,
        question,
        user_id: user.id, // Adicionado novamente - necessário para a política de segurança RLS
      };

      // Buscar pelo menos uma matéria do usuário
      if (!subjectId) {
        const { data: subjects, error: subjectsError } = await supabase
          .from("subjects")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (subjectsError) {
          console.error("Error fetching subjects:", subjectsError);
        } else if (subjects && subjects.length > 0) {
          entryData.subject_id = subjects[0].id;
        }
      } else {
        entryData.subject_id = subjectId;
      }
      
      // Adicionar campos opcionais
      if (categoryId) entryData.category_id = categoryId;
      if (sourceId) entryData.source_id = sourceId;
      if (difficulty) entryData.difficulty = difficulty;
      if (notes) entryData.notes = notes;
      
      console.log("Trying to insert error entry with data:", entryData);
      
      const { data, error } = await supabase
        .from("error_entries")
        .insert([entryData])
        .select()
        .single();

      if (error) {
        console.error("Detailed error adding error entry:", error);
        throw error;
      }

      // Atualiza o estado local
      setEvent(prev => {
        if (!prev) return null
        return {
          ...prev,
          error_entries: [...(prev.error_entries || []), data]
        }
      })

      return data
    } catch (error) {
      console.error("Error adding error entry:", error)
      throw error
    }
  }

  const updateErrorEntry = async (
    errorEntryId: string,
    updates: { question?: string; subject_id?: string; category_id?: string; source_id?: string; difficulty?: string; notes?: string }
  ) => {
    if (!event) return

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

      // Atualiza o estado local
      setEvent(prev => {
        if (!prev) return null
        return {
          ...prev,
          error_entries: prev.error_entries?.map((ee) =>
            ee.id === errorEntryId ? data : ee
          ) || []
        }
      })
      
      return data
    } catch (error) {
      console.error("Error updating error entry:", error)
      throw error
    }
  }

  const deleteErrorEntry = async (errorEntryId: string) => {
    if (!event) return

    try {
      const { error } = await supabase
        .from("error_entries")
        .delete()
        .eq("id", errorEntryId)

      if (error) throw error

      // Atualiza o estado local
      setEvent(prev => {
        if (!prev) return null
        return {
          ...prev,
          error_entries: prev.error_entries?.filter(
            (ee) => ee.id !== errorEntryId
          ) || []
        }
      })
    } catch (error) {
      console.error("Error deleting error entry:", error)
      throw error
    }
  }

  return {
    event,
    loading,
    fetchEvent,
    toggleComplete,
    updateEventNotes,
    updateEventQuestions,
    linkContent,
    unlinkContent,
    addErrorEntry,
    updateErrorEntry,
    deleteErrorEntry
  }
}
