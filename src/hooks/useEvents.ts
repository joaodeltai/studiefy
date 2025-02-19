"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useXP } from "./useXP"
import { useEffect, useState } from "react"

export type EventType = 'prova' | 'trabalho' | 'simulado'

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

      // Mapear content_ids para cada evento
      const eventsWithContents = eventsData.map(event => ({
        ...event,
        content_ids: eventContentsData
          .filter(ec => ec.event_id === event.id)
          .map(ec => ec.content_id)
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

      setEvents((prev) => [...prev, { ...data, content_ids: [] }])
      return data
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
          : 5
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
        : 5

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

  return {
    events,
    loading,
    addEvent,
    deleteEvent,
    toggleComplete,
    linkContent,
    unlinkContent,
  }
}
