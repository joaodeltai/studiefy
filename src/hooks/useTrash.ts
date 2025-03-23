"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { addDays, isBefore } from "date-fns"

// Tipos para os itens da lixeira
export interface TrashItem {
  id: string
  title: string
  type: 'content' | 'event' // Tipo do item (conteúdo ou evento)
  deleted_at: string
  subject_id: string
  subject_name?: string
  due_date?: string | null
  expiration_date: string // Data quando será excluído permanentemente
}

export function useTrash() {
  const { user } = useAuth()
  const [trashItems, setTrashItems] = useState<TrashItem[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar itens da lixeira
  const fetchTrashItems = useCallback(async () => {
    if (!user) {
      setTrashItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Buscar conteúdos excluídos
      const { data: contentsData, error: contentsError } = await supabase
        .from("contents")
        .select(`
          id,
          title,
          subject_id,
          due_date,
          updated_at,
          subjects(name)
        `)
        .eq("deleted", true)
        .order("updated_at", { ascending: false })

      if (contentsError) {
        console.error("Error fetching trash contents:", contentsError)
        toast.error("Erro ao carregar itens da lixeira")
        return
      }

      // Buscar eventos excluídos
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          id,
          title,
          subject_id,
          date,
          updated_at,
          subjects(name)
        `)
        .eq("deleted", true)
        .order("updated_at", { ascending: false })

      if (eventsError) {
        console.error("Error fetching trash events:", eventsError)
        toast.error("Erro ao carregar eventos da lixeira")
        return
      }

      // Formatar os dados dos conteúdos
      const formattedContents = contentsData.map((content: any) => ({
        id: content.id,
        title: content.title,
        type: 'content' as const,
        deleted_at: content.updated_at,
        subject_id: content.subject_id,
        subject_name: content.subjects?.name,
        due_date: content.due_date,
        expiration_date: addDays(new Date(content.updated_at), 15).toISOString()
      }))

      // Formatar os dados dos eventos
      const formattedEvents = eventsData.map((event: any) => ({
        id: event.id,
        title: event.title,
        type: 'event' as const,
        deleted_at: event.updated_at,
        subject_id: event.subject_id,
        subject_name: event.subjects?.name,
        due_date: event.date,
        expiration_date: addDays(new Date(event.updated_at), 15).toISOString()
      }))

      // Combinar os dados
      const allTrashItems = [...formattedContents, ...formattedEvents]
        .sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime())

      setTrashItems(allTrashItems)
    } catch (error) {
      console.error("Error fetching trash items:", error)
      toast.error("Erro ao carregar itens da lixeira")
    } finally {
      setLoading(false)
    }
  }, [user])

  // Carregar itens da lixeira ao inicializar
  useEffect(() => {
    fetchTrashItems()
  }, [fetchTrashItems])

  // Restaurar um item da lixeira
  const restoreItem = async (id: string, type: 'content' | 'event') => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    try {
      const table = type === 'content' ? 'contents' : 'events'
      
      const { error } = await supabase
        .from(table)
        .update({ deleted: false })
        .eq("id", id)

      if (error) {
        console.error(`Error restoring ${type}:`, error)
        toast.error(`Erro ao restaurar ${type === 'content' ? 'conteúdo' : 'evento'}`)
        return
      }

      // Atualizar a lista local
      setTrashItems(trashItems.filter(item => !(item.id === id && item.type === type)))
      toast.success(`${type === 'content' ? 'Conteúdo' : 'Evento'} restaurado com sucesso!`)
    } catch (error) {
      console.error(`Error restoring ${type}:`, error)
      toast.error(`Erro ao restaurar ${type === 'content' ? 'conteúdo' : 'evento'}`)
    }
  }

  // Excluir permanentemente um item
  const deleteItemPermanently = async (id: string, type: 'content' | 'event') => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    try {
      const table = type === 'content' ? 'contents' : 'events'
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id)

      if (error) {
        console.error(`Error deleting ${type}:`, error)
        toast.error(`Erro ao excluir ${type === 'content' ? 'conteúdo' : 'evento'}`)
        return
      }

      // Atualizar a lista local
      setTrashItems(trashItems.filter(item => !(item.id === id && item.type === type)))
      toast.success(`${type === 'content' ? 'Conteúdo' : 'Evento'} excluído permanentemente!`)
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      toast.error(`Erro ao excluir ${type === 'content' ? 'conteúdo' : 'evento'}`)
    }
  }

  // Verificar itens expirados e excluí-los permanentemente
  const cleanupExpiredItems = async () => {
    if (!user) return

    try {
      const now = new Date()
      const expiredItems = trashItems.filter(item => 
        isBefore(new Date(item.expiration_date), now)
      )

      for (const item of expiredItems) {
        const table = item.type === 'content' ? 'contents' : 'events'
        
        await supabase
          .from(table)
          .delete()
          .eq("id", item.id)
      }

      // Atualizar a lista local removendo os itens expirados
      if (expiredItems.length > 0) {
        setTrashItems(trashItems.filter(item => 
          !expiredItems.some(expiredItem => 
            expiredItem.id === item.id && expiredItem.type === item.type
          )
        ))
      }
    } catch (error) {
      console.error("Error cleaning up expired items:", error)
    }
  }

  // Limpar toda a lixeira
  const emptyTrash = async () => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    try {
      // Excluir todos os conteúdos na lixeira
      const contentIds = trashItems
        .filter(item => item.type === 'content')
        .map(item => item.id)
      
      if (contentIds.length > 0) {
        const { error: contentsError } = await supabase
          .from("contents")
          .delete()
          .in("id", contentIds)

        if (contentsError) {
          console.error("Error emptying contents trash:", contentsError)
          toast.error("Erro ao limpar conteúdos da lixeira")
          return
        }
      }

      // Excluir todos os eventos na lixeira
      const eventIds = trashItems
        .filter(item => item.type === 'event')
        .map(item => item.id)
      
      if (eventIds.length > 0) {
        const { error: eventsError } = await supabase
          .from("events")
          .delete()
          .in("id", eventIds)

        if (eventsError) {
          console.error("Error emptying events trash:", eventsError)
          toast.error("Erro ao limpar eventos da lixeira")
          return
        }
      }

      // Limpar a lista local
      setTrashItems([])
      toast.success("Lixeira esvaziada com sucesso!")
    } catch (error) {
      console.error("Error emptying trash:", error)
      toast.error("Erro ao esvaziar lixeira")
    }
  }

  return {
    trashItems,
    loading,
    fetchTrashItems,
    restoreItem,
    deleteItemPermanently,
    cleanupExpiredItems,
    emptyTrash
  }
}
