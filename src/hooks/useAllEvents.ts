"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"
import { EventType } from "./useEvents"
import { useXP } from "./useXP"

export interface EventWithSubject {
  id: string
  subject_id: string
  title: string
  type: EventType
  date: string
  completed: boolean
  created_at: string
  updated_at: string
  subject: {
    name: string
    color: string
  }
}

export function useAllEvents() {
  const [events, setEvents] = useState<EventWithSubject[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { addXP, removeXP } = useXP()

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

  const deleteEvent = async (eventId: string) => {
    try {
      const event = events.find((e) => e.id === eventId)
      if (!event) {
        throw new Error(`Event not found: ${eventId}`)
      }

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId)

      if (error) {
        throw error
      }

      // Se o evento estava concluído, remove o XP correspondente
      if (event.completed) {
        const xpAmount = event.type === 'trabalho' 
          ? 2 
          : event.type === 'prova' || event.type === 'simulado'
          ? 3
          : 1
        
        await removeXP(xpAmount)
      }

      setEvents((prev) => prev.filter((event) => event.id !== eventId))
    } catch (error) {
      console.error("Error deleting event:", error)
      throw error
    }
  }

  const toggleComplete = async (eventId: string) => {
    try {
      const event = events.find((e) => e.id === eventId)
      if (!event) {
        throw new Error(`Event not found: ${eventId}`)
      }

      // Atualiza o estado local para feedback imediato
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, completed: !e.completed } : e
        )
      )

      // Atualiza no Supabase
      const { error } = await supabase
        .from("events")
        .update({ 
          completed: !event.completed,
          updated_at: new Date().toISOString()
        })
        .eq("id", eventId)
        .select()

      if (error) {
        // Se houver erro, reverte o estado local
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId ? { ...e, completed: event.completed } : e
          )
        )
        throw error
      }

      // Calcula o XP baseado no tipo do evento
      const xpAmount = event.type === 'trabalho' 
        ? 2 
        : event.type === 'prova' || event.type === 'simulado'
        ? 3
        : 1

      // Se o evento foi marcado como concluído, adiciona XP
      // Se foi desmarcado, remove XP
      if (!event.completed) {
        await addXP(xpAmount)
      } else {
        await removeXP(xpAmount)
      }

      // Atualiza os dados locais
      await fetchEvents()
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
  }
}
