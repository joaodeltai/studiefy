"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { toast } from "sonner"

export interface EventSource {
  id: string
  name: string
  user_id: string
  created_at: string
}

export function useEventSources() {
  const [sources, setSources] = useState<EventSource[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setSources([])
      setLoading(false)
      return
    }

    fetchSources()
  }, [user])

  const fetchSources = async () => {
    if (!user) {
      setSources([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("event_sources")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching event sources:", error)
        toast.error("Erro ao carregar origens de eventos")
        return
      }

      setSources(data || [])
    } catch (error) {
      console.error("Error fetching event sources:", error)
      toast.error("Erro ao carregar origens de eventos")
    } finally {
      setLoading(false)
    }
  }

  const addSource = async (name: string) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    if (!name.trim()) {
      toast.error("Nome da origem é obrigatório")
      return
    }

    try {
      const newSource = {
        name: name.trim(),
        user_id: user.id,
      }

      const { data, error } = await supabase
        .from("event_sources")
        .insert([newSource])
        .select()
        .single()

      if (error) {
        console.error("Error adding event source:", error)
        toast.error("Erro ao adicionar origem de evento")
        return
      }

      setSources(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error("Error adding event source:", error)
      toast.error("Erro ao adicionar origem de evento")
    }
  }

  const updateSource = async (id: string, name: string) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    if (!id) {
      toast.error("Origem não encontrada")
      return
    }

    if (!name.trim()) {
      toast.error("Nome da origem é obrigatório")
      return
    }

    try {
      const { error } = await supabase
        .from("event_sources")
        .update({ name: name.trim() })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating event source:", error)
        toast.error("Erro ao atualizar origem")
        return
      }

      setSources(prev => 
        prev.map(source => 
          source.id === id ? { ...source, name: name.trim() } : source
        )
      )
    } catch (error) {
      console.error("Error updating event source:", error)
      toast.error("Erro ao atualizar origem")
    }
  }

  const deleteSource = async (id: string) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    if (!id) {
      toast.error("Origem não encontrada")
      return
    }

    try {
      const { error } = await supabase
        .from("event_sources")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error deleting event source:", error)
        toast.error("Erro ao remover origem")
        return
      }

      setSources(prev => prev.filter(source => source.id !== id))
    } catch (error) {
      console.error("Error deleting event source:", error)
      toast.error("Erro ao remover origem")
    }
  }

  return {
    sources,
    loading,
    addSource,
    updateSource,
    deleteSource,
  }
}
