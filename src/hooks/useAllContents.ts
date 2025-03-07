"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"
import { PriorityLevel } from "./useContents"

export interface ContentWithSubject {
  id: string
  subject_id: string
  title: string
  completed: boolean
  priority: PriorityLevel
  due_date: string | null
  tags: string[]
  created_at: string
  updated_at: string
  subject: {
    name: string
    color: string
  }
}

export interface ContentFilters {
  startDate: Date | null
  endDate: Date | null
  priority: PriorityLevel | 'all'
  tags: string[]
  categoryId: string | null
}

const defaultFilters: ContentFilters = {
  startDate: null,
  endDate: null,
  priority: 'all',
  tags: [],
  categoryId: null
}

export function useAllContents() {
  const [contents, setContents] = useState<ContentWithSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ContentFilters>(defaultFilters)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchContents()
    }
  }, [user, filters])

  // Remover log para evitar possíveis problemas
  // useEffect(() => {
  //   console.log("Filtros atualizados:", filters)
  // }, [filters])

  const fetchContents = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from("contents")
        .select(`
          *,
          subject:subjects(name, color)
        `)
        .eq('completed', false)
        .order('due_date', { ascending: true, nullsLast: true })

      // Aplicar filtros
      if (filters.startDate) {
        query = query.gte('due_date', filters.startDate.toISOString())
      }
      if (filters.endDate) {
        query = query.lte('due_date', filters.endDate.toISOString())
      }
      if (filters.priority !== 'all') {
        query = query.eq('priority', filters.priority)
      }
      if (filters.tags.length > 0) {
        query = query.contains('tags', filters.tags)
      }
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      const { data: contentsData, error: contentsError } = await query

      if (contentsError) {
        throw contentsError
      }

      // Ordenar por prioridade (Alta > Média > Baixa > null)
      const priorityOrder = { 'Alta': 0, 'Média': 1, 'Baixa': 2, null: 3 }
      const sortedContents = contentsData.sort((a, b) => {
        // Primeiro por data de vencimento
        if (a.due_date && b.due_date) {
          const dateComparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          if (dateComparison !== 0) return dateComparison
        }
        if (a.due_date && !b.due_date) return -1
        if (!a.due_date && b.due_date) return 1
        
        // Depois por prioridade
        return (priorityOrder[a.priority ?? null] ?? 3) - (priorityOrder[b.priority ?? null] ?? 3)
      })

      setContents(sortedContents || [])

      // Coletar todas as tags únicas
      const allTags = new Set<string>()
      contentsData?.forEach(content => {
        content.tags?.forEach(tag => allTags.add(tag))
      })
      setAvailableTags(Array.from(allTags))

    } catch (error) {
      console.error("Error fetching contents:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleComplete = async (id: string) => {
    try {
      const content = contents.find(c => c.id === id)
      if (!content) return

      const { error } = await supabase
        .from("contents")
        .update({ completed: !content.completed })
        .eq("id", id)

      if (error) {
        throw error
      }

      setContents(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error("Error toggling content completion:", error)
      throw error
    }
  }

  const moveToTrash = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contents")
        .update({ deleted: true })
        .eq("id", id)

      if (error) {
        throw error
      }

      setContents(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error("Error moving content to trash:", error)
      throw error
    }
  }

  const updatePriority = async (id: string, priority: PriorityLevel) => {
    try {
      const { error } = await supabase
        .from("contents")
        .update({ priority })
        .eq("id", id)

      if (error) {
        throw error
      }

      setContents(prev => prev.map(content => 
        content.id === id ? { ...content, priority } : content
      ))
    } catch (error) {
      console.error("Error updating content priority:", error)
      throw error
    }
  }

  const updateDueDate = async (id: string, dueDate: Date | null) => {
    try {
      const { error } = await supabase
        .from("contents")
        .update({ due_date: dueDate?.toISOString() })
        .eq("id", id)

      if (error) {
        throw error
      }

      setContents(prev => prev.map(content => 
        content.id === id ? { ...content, due_date: dueDate?.toISOString() ?? null } : content
      ))
    } catch (error) {
      console.error("Error updating content due date:", error)
      throw error
    }
  }

  const updateFilters = (newFilters: Partial<ContentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  return {
    contents,
    loading,
    filters,
    availableTags,
    toggleComplete,
    moveToTrash,
    updatePriority,
    updateDueDate,
    updateFilters,
  }
}
