"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useXP } from "./useXP"
import { useStreak } from "./useStreak"
import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import { isAfter, isBefore, startOfDay } from "date-fns"

export type PriorityLevel = 'Alta' | 'Média' | 'Baixa' | null

export interface Content {
  id: string
  title: string
  priority: PriorityLevel
  completed: boolean
  deleted: boolean
  tags: string[]
  due_date: string | null
  subject_id: string
  category_id: string | null
  focus_time?: number // tempo em segundos
  created_at: string
  updated_at: string
}

interface ContentFilters {
  startDate: Date | null
  endDate: Date | null
  priority: PriorityLevel | 'all'
  tags: string[]
  categoryId: string | null
}

export function useContents(subjectId: string) {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ContentFilters>({
    startDate: null,
    endDate: null,
    priority: 'all',
    tags: [],
    categoryId: null
  })
  const { user } = useAuth()
  const { user: userStreak } = useAuth()
  const { addXP, removeXP } = useXP()
  const { updateStreak } = useStreak()

  // Extrair todas as tags únicas dos conteúdos
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    contents.forEach((content) => {
      content.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [contents])

  // Aplicar filtros aos conteúdos
  const filteredContents = useMemo(() => {
    return contents.filter((content) => {
      // Filtro de data
      if (filters.startDate && content.due_date) {
        const dueDate = startOfDay(new Date(content.due_date))
        if (isBefore(dueDate, startOfDay(filters.startDate))) {
          return false
        }
      }

      if (filters.endDate && content.due_date) {
        const dueDate = startOfDay(new Date(content.due_date))
        if (isAfter(dueDate, startOfDay(filters.endDate))) {
          return false
        }
      }

      // Filtro de prioridade
      if (filters.priority !== 'all' && content.priority !== filters.priority) {
        return false
      }

      // Filtro de tags
      if (filters.tags.length > 0) {
        if (!content.tags.some(tag => filters.tags.includes(tag))) {
          return false
        }
      }
      
      // Filtro de categoria
      if (filters.categoryId && content.category_id !== filters.categoryId) {
        return false
      }

      return true
    }).sort((a, b) => {
      // Ordenar por prioridade
      const priorityOrder: Record<string, number> = { 'Alta': 0, 'Média': 1, 'Baixa': 2 }
      const priorityA = a.priority ? priorityOrder[a.priority] : 3
      const priorityB = b.priority ? priorityOrder[b.priority] : 3
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      // Se a prioridade for igual, ordenar por data de criação
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [contents, filters])

  useEffect(() => {
    if (!user) {
      setContents([])
      setLoading(false)
      return
    }

    if (subjectId) {
      fetchContents()
    }
  }, [user, subjectId])

  const extractTags = (text: string): { tags: string[] } => {
    const tags: string[] = []
    const regex = /#(\w+)/g
    let match

    while ((match = regex.exec(text)) !== null) {
      tags.push(match[1].toLowerCase())
    }

    return { tags }
  }

  const fetchContents = async () => {
    if (!user) {
      setContents([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("contents")
        .select("*")
        .eq("subject_id", subjectId)
        .eq("deleted", false)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching contents:", error)
        toast.error("Erro ao carregar conteúdos")
        return
      }

      setContents(data || [])
    } catch (error) {
      console.error("Error fetching contents:", error)
      toast.error("Erro ao carregar conteúdos")
    } finally {
      setLoading(false)
    }
  }

  const addContent = async ({
    title,
    priority = null,
    dueDate = null,
    categoryId = null
  }: {
    title: string
    priority?: PriorityLevel
    dueDate?: Date | null
    categoryId?: string | null
  }) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    if (!title.trim()) {
      toast.error("Título é obrigatório")
      return
    }

    if (!subjectId) {
      toast.error("Matéria não encontrada")
      return
    }

    try {
      const { tags } = extractTags(title)
      
      const newContent = {
        title: title.trim(),
        priority: priority,
        subject_id: subjectId,
        category_id: categoryId,
        completed: false,
        deleted: false,
        tags: tags,
        due_date: dueDate?.toISOString() || null
      }

      const { data, error } = await supabase
        .from("contents")
        .insert([newContent])
        .select()
        .single()

      if (error) {
        console.error("Error adding content:", error)
        if (error.code === '23502') { // not null violation
          toast.error("Erro: Campo obrigatório não preenchido")
        } else {
          toast.error("Erro ao adicionar conteúdo")
        }
        return
      }

      setContents(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error("Error adding content:", error)
      toast.error("Erro ao adicionar conteúdo")
    }
  }

  const updatePriority = async (id: string, priority: PriorityLevel) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    if (!id) {
      toast.error("Conteúdo não encontrado")
      return
    }

    try {
      const { error } = await supabase
        .from("contents")
        .update({ priority: priority })
        .eq("id", id)

      if (error) {
        console.error("Error updating priority:", error)
        toast.error("Erro ao atualizar prioridade")
        return
      }

      setContents((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, priority } : c
        )
      )
    } catch (error) {
      console.error("Error updating priority:", error)
      toast.error("Erro ao atualizar prioridade")
    }
  }

  const updateDueDate = async (id: string, dueDate: Date | null) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    if (!id) {
      toast.error("Conteúdo não encontrado")
      return
    }

    try {
      const { error } = await supabase
        .from("contents")
        .update({ due_date: dueDate?.toISOString() || null })
        .eq("id", id)

      if (error) {
        console.error("Error updating due date:", error)
        toast.error("Erro ao atualizar data")
        return
      }

      setContents((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, due_date: dueDate?.toISOString() || null } : c
        )
      )
    } catch (error) {
      console.error("Error updating due date:", error)
      toast.error("Erro ao atualizar data")
    }
  }

  const toggleComplete = async (id: string) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    try {
      const content = contents.find((c) => c.id === id)
      if (!content) {
        toast.error("Conteúdo não encontrado")
        return
      }

      const { error } = await supabase
        .from("contents")
        .update({ completed: !content.completed })
        .eq("id", id)

      if (error) {
        console.error("Error toggling content completion:", error)
        toast.error("Erro ao atualizar conteúdo")
        return
      }

      // Se o conteúdo foi marcado como concluído, adiciona 1 XP
      // Se foi desmarcado, remove 1 XP
      if (!content.completed) {
        await addXP(1)
      } else {
        await removeXP(1)
      }

      setContents((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, completed: !c.completed } : c
        )
      )
    } catch (error) {
      console.error("Error toggling content completion:", error)
      toast.error("Erro ao atualizar conteúdo")
    }
  }

  const moveToTrash = async (id: string) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    try {
      const content = contents.find(c => c.id === id)
      if (!content) {
        toast.error("Conteúdo não encontrado")
        return
      }

      const { error } = await supabase
        .from("contents")
        .update({ deleted: true })
        .eq("id", id)

      if (error) {
        console.error("Error moving content to trash:", error)
        toast.error("Erro ao mover para a lixeira")
        return
      }

      // Se o conteúdo estava concluído, remove 1 XP
      if (content.completed) {
        await removeXP(1)
      }

      setContents((prev) => prev.filter((content) => content.id !== id))
    } catch (error) {
      console.error("Error moving content to trash:", error)
      toast.error("Erro ao mover para a lixeira")
    }
  }

  const updateFilters = (newFilters: Partial<ContentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const updateFocusTime = async (contentId: string, focusTime: number) => {
    try {
      const content = contents.find((c) => c.id === contentId)
      if (!content) return

      // Calcula o novo tempo total de foco
      const newFocusTime = (content.focus_time || 0) + focusTime

      const { error } = await supabase
        .from("contents")
        .update({
          focus_time: newFocusTime,
          updated_at: new Date().toISOString()
        })
        .eq("id", contentId)

      if (error) {
        throw error
      }

      // Atualiza o estado local primeiro
      setContents((prev) =>
        prev.map((c) =>
          c.id === contentId
            ? { ...c, focus_time: newFocusTime }
            : c
        )
      )

      // Atualiza a ofensiva se o tempo de foco for maior que 30 minutos
      // Importante: passamos o focusTime (tempo da sessão) e não newFocusTime (tempo total)
      if (focusTime >= 1800) {
        try {
          await updateStreak(focusTime)
        } catch (error) {
          console.error("Error updating streak:", error)
          // Não lançamos o erro aqui para não interromper a atualização do tempo de foco
        }
      }

      return newFocusTime
    } catch (error) {
      console.error("Error updating focus time:", error)
      throw error
    }
  }

  const updateTitle = async (id: string, title: string) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    if (!id) {
      toast.error("Conteúdo não encontrado")
      return
    }

    if (!title.trim()) {
      toast.error("Título é obrigatório")
      return
    }

    try {
      const { error } = await supabase
        .from("contents")
        .update({ title: title.trim() })
        .eq("id", id)

      if (error) {
        console.error("Error updating title:", error)
        toast.error("Erro ao atualizar título")
        return
      }

      setContents((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, title: title.trim() } : c
        )
      )
    } catch (error) {
      console.error("Error updating title:", error)
      toast.error("Erro ao atualizar título")
    }
  }

  return {
    contents: filteredContents,
    availableTags,
    filters,
    loading,
    addContent,
    toggleComplete,
    moveToTrash,
    updatePriority,
    updateDueDate,
    updateFilters,
    updateFocusTime,
    updateTitle,
    refreshContents: fetchContents,
  }
}
