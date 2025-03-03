"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { EventWithSubject } from "./useAllEvents"
import { parseISO } from "date-fns"

export function useGrades() {
  const [events, setEvents] = useState<EventWithSubject[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
        fetchEventsWithGrades()
    }
  }, [user])

  const fetchEventsWithGrades = async () => {
    try {
      setLoading(true)
      
      // Buscar apenas eventos que tenham grade ou essay_grade preenchidos
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          subject:subjects(name, color)
        `)
        .or('grade.not.is.null,essay_grade.not.is.null')
        .order("date", { ascending: false })

      if (error) {
        throw error
      }

      setEvents(data || [])
    } catch (error) {
      console.error("Error fetching events with grades:", error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  // Função para filtrar eventos por matéria
  const filterBySubject = (subjectId: string) => {
    if (subjectId === "all") {
      return events
    }
    return events.filter(event => event.subject_id === subjectId)
  }

  // Função para filtrar eventos por data
  const filterByDate = (date: Date) => {
    const targetDate = date.toISOString().split('T')[0]
    return events.filter(event => {
      const eventDate = parseISO(event.date).toISOString().split('T')[0]
      return eventDate === targetDate
    })
  }

  return {
    events,
    loading,
    filterBySubject,
    filterByDate,
    refresh: fetchEventsWithGrades
  }
}
