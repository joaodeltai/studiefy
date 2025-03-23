"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useXP } from "./useXP"
import { useStreak } from "./useStreak"
import { usePlanLimits, FREE_PLAN_LIMITS } from "./usePlanLimits"
import { useEffect, useState, useMemo } from "react"
import { toast } from "sonner"
import { isAfter, isBefore, startOfDay } from "date-fns"

// Chave para o cache de conteúdos no localStorage
const CONTENTS_CACHE_KEY = 'studiefy:contents:cache';
// Tempo de expiração do cache em milissegundos (15 minutos)
const CACHE_EXPIRATION_TIME = 15 * 60 * 1000;

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
  notes?: string // campo de anotações
  created_at: string
  updated_at: string
}

// Interface para o objeto de cache
interface ContentsCache {
  contents: Content[];
  timestamp: number;
  userId: string;
  subjectId: string;
}

interface ContentFilters {
  startDate: Date | null
  endDate: Date | null
  priority: PriorityLevel | 'all'
  tags: string[]
  categoryId: string | null
}

export interface ContentError extends Error {
  code: string
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
  const { isPremium, hasReachedContentsLimit } = usePlanLimits()

  // Função para salvar o cache no localStorage
  const saveContentsCache = (contentsData: Content[]) => {
    try {
      if (!user || !subjectId) return;
      
      const cacheData: ContentsCache = {
        contents: contentsData,
        timestamp: Date.now(),
        userId: user.id,
        subjectId: subjectId
      };
      
      // Usar o subjectId como parte da chave para criar um cache por matéria
      const cacheKey = `${CONTENTS_CACHE_KEY}:${subjectId}`;
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erro ao salvar cache de conteúdos:', error);
    }
  };

  // Função para carregar o cache do localStorage
  const loadContentsCache = (): ContentsCache | null => {
    try {
      if (!user || !subjectId) return null;
      
      // Usar o subjectId como parte da chave para recuperar o cache específico da matéria
      const cacheKey = `${CONTENTS_CACHE_KEY}:${subjectId}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) return null;
      
      const parsedCache = JSON.parse(cachedData) as ContentsCache;
      
      // Verificar se o cache pertence ao usuário atual e à matéria atual
      if (parsedCache.userId !== user.id || parsedCache.subjectId !== subjectId) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      // Verificar se o cache está expirado
      if (Date.now() - parsedCache.timestamp > CACHE_EXPIRATION_TIME) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return parsedCache;
    } catch (error) {
      console.error('Erro ao carregar cache de conteúdos:', error);
      return null;
    }
  };

  // Função para limpar o cache de conteúdos
  const clearContentsCache = () => {
    try {
      if (!subjectId) return;
      
      const cacheKey = `${CONTENTS_CACHE_KEY}:${subjectId}`;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Erro ao remover cache de conteúdos:', error);
    }
  };

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

  const fetchContents = async (forceRefresh = false) => {
    if (!user || !subjectId) {
      setContents([])
      setLoading(false)
      return
    }

    // Se não for forçado a atualizar, verifique o cache primeiro
    if (!forceRefresh) {
      const cachedData = loadContentsCache();
      if (cachedData) {
        setContents(cachedData.contents);
        setLoading(false);
        return;
      }
    } else {
      // Se forçar atualização, limpe o cache atual
      clearContentsCache();
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

      const contentsData = data || [];
      setContents(contentsData)
      saveContentsCache(contentsData);
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

    // Verifica se o usuário atingiu o limite de conteúdos no plano Free
    if (!isPremium && contents.length >= FREE_PLAN_LIMITS.MAX_CONTENTS_PER_SUBJECT) {
      const error = new Error(`Você atingiu o limite de ${FREE_PLAN_LIMITS.MAX_CONTENTS_PER_SUBJECT} conteúdos por matéria no plano Free. Faça upgrade para o plano Premium para adicionar mais conteúdos.`) as ContentError;
      error.code = 'PLAN_LIMIT_REACHED';
      
      toast.error(error.message, {
        description: "Acesse a página de assinatura para fazer upgrade.",
        action: {
          label: "Ver planos",
          onClick: () => window.location.href = "/dashboard/subscription"
        }
      });
      
      throw error;
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

      const updatedContents = [data, ...contents];
      setContents(updatedContents)
      saveContentsCache(updatedContents);

      toast.success("Conteúdo adicionado com sucesso!")
      return data
    } catch (error: any) {
      console.error("Error adding content:", error)
      
      // Não exibe mensagem de erro caso já tenha sido exibida pelo verificador de limite
      if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
        toast.error("Erro ao adicionar conteúdo")
      }
      
      throw error;
    }
  }

  const updateContent = async (id: string, updatedData: Partial<Content>) => {
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
        .update(updatedData)
        .eq("id", id)

      if (error) {
        console.error("Error updating content:", error)
        toast.error("Erro ao atualizar conteúdo")
        return
      }

      const updatedContents = contents.map((content) =>
        content.id === id ? { ...content, ...updatedData } : content
      );
      setContents(updatedContents);
      saveContentsCache(updatedContents);

      toast.success("Conteúdo atualizado com sucesso!")
      return updatedData
    } catch (error) {
      console.error("Error updating content:", error)
      toast.error("Erro ao atualizar conteúdo")
      throw error
    }
  }

  const deleteContent = async (id: string) => {
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
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Error deleting content:", error)
        toast.error("Erro ao excluir conteúdo")
        return
      }

      // Se o conteúdo estava concluído, remove 1 XP
      if (content.completed) {
        await removeXP(1)
      }

      const updatedContents = contents.filter((content) => content.id !== id);
      setContents(updatedContents);
      saveContentsCache(updatedContents);

      toast.success("Conteúdo excluído com sucesso!")
    } catch (error) {
      console.error("Error deleting content:", error)
      toast.error("Erro ao excluir conteúdo")
      throw error
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

      const updatedContents = contents.map((content) =>
        content.id === id ? { ...content, completed: !content.completed } : content
      );
      setContents(updatedContents);
      saveContentsCache(updatedContents);

      toast.success("Conteúdo atualizado com sucesso!")
    } catch (error) {
      console.error("Error toggling content completion:", error)
      toast.error("Erro ao atualizar conteúdo")
      throw error
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

      const updatedContents = contents.map((content) =>
        content.id === id ? { ...content, priority } : content
      );
      setContents(updatedContents);
      saveContentsCache(updatedContents);

      toast.success("Prioridade atualizada com sucesso!")
    } catch (error) {
      console.error("Error updating priority:", error)
      toast.error("Erro ao atualizar prioridade")
      throw error
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

      const updatedContents = contents.map((content) =>
        content.id === id ? { ...content, due_date: dueDate?.toISOString() || null } : content
      );
      setContents(updatedContents);
      saveContentsCache(updatedContents);

      toast.success("Data atualizada com sucesso!")
    } catch (error) {
      console.error("Error updating due date:", error)
      toast.error("Erro ao atualizar data")
      throw error
    }
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
      const updatedContents = contents.map((c) =>
        c.id === contentId
          ? { ...c, focus_time: newFocusTime }
          : c
      );
      setContents(updatedContents);
      saveContentsCache(updatedContents);

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

      const updatedContents = contents.map((content) =>
        content.id === id ? { ...content, title: title.trim() } : content
      );
      setContents(updatedContents);
      saveContentsCache(updatedContents);

      toast.success("Título atualizado com sucesso!")
    } catch (error) {
      console.error("Error updating title:", error)
      toast.error("Erro ao atualizar título")
      throw error
    }
  }

  const updateCategory = async (id: string, categoryId: string | null) => {
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
        .update({ category_id: categoryId })
        .eq("id", id)

      if (error) {
        console.error("Error updating category:", error)
        toast.error("Erro ao atualizar categoria")
        return
      }

      const updatedContents = contents.map((content) =>
        content.id === id ? { ...content, category_id: categoryId } : content
      );
      setContents(updatedContents);
      saveContentsCache(updatedContents);

      toast.success("Categoria atualizada com sucesso!")
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error("Erro ao atualizar categoria")
      throw error
    }
  }

  const updateNotes = async (id: string, notes: string) => {
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
        .update({ notes: notes })
        .eq("id", id)

      if (error) {
        console.error("Error updating notes:", error)
        toast.error("Erro ao atualizar anotações")
        return
      }

      const updatedContents = contents.map((content) =>
        content.id === id ? { ...content, notes } : content
      );
      setContents(updatedContents);
      saveContentsCache(updatedContents);

      // Não mostra toast para não interromper o fluxo do usuário
    } catch (error) {
      console.error("Error updating notes:", error)
      toast.error("Erro ao atualizar anotações")
      throw error
    }
  }

  // Verificar se o usuário atingiu o limite de conteúdos
  const hasReachedLimit = hasReachedContentsLimit(contents.length)
  
  // Calcular quantos conteúdos ainda podem ser adicionados
  const remainingContents = isPremium 
    ? Infinity 
    : Math.max(0, FREE_PLAN_LIMITS.MAX_CONTENTS_PER_SUBJECT - contents.length)

  const updateFilters = (newFilters: Partial<ContentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const moveToTrash = async (id: string) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    if (!id) {
      toast.error("Conteúdo não encontrado")
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
        toast.error("Erro ao mover conteúdo para a lixeira")
        return
      }

      // Se o conteúdo estava concluído, remove 1 XP
      if (content.completed) {
        await removeXP(1)
      }

      const updatedContents = contents.filter((content) => content.id !== id);
      setContents(updatedContents);
      saveContentsCache(updatedContents);

      toast.success("Conteúdo movido para a lixeira!")
    } catch (error) {
      console.error("Error moving content to trash:", error)
      toast.error("Erro ao mover conteúdo para a lixeira")
      throw error
    }
  }

  return {
    contents: filteredContents,
    allContents: contents,
    loading,
    filters,
    setFilters,
    updateFilters,
    addContent,
    updateContent,
    deleteContent,
    toggleComplete,
    moveToTrash,
    updatePriority,
    updateDueDate,
    updateFocusTime,
    updateCategory,
    updateTitle,
    updateNotes,
    availableTags,
    hasReachedLimit,
    remainingContents,
    refreshContents: (force = false) => fetchContents(force)
  }
}
