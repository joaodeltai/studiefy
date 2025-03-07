"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { toast } from "sonner"

export interface SubjectCategory {
  id: string
  name: string
  subject_id: string
  user_id: string
  created_at: string
}

export function useSubjectCategories(subjectId: string) {
  const [categories, setCategories] = useState<SubjectCategory[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setCategories([])
      setLoading(false)
      return
    }

    if (!subjectId) {
      // Quando subjectId está vazio, carrega todas as categorias
      fetchAllCategories()
      return
    }

    fetchCategories()
  }, [user, subjectId])

  const fetchAllCategories = async () => {
    if (!user) {
      setCategories([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("subject_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching all categories:", error)
        toast.error("Erro ao carregar categorias")
        return
      }

      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching all categories:", error)
      toast.error("Erro ao carregar categorias")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    if (!user || !subjectId) {
      setCategories([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("subject_categories")
        .select("*")
        .eq("subject_id", subjectId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching categories:", error)
        toast.error("Erro ao carregar categorias")
        return
      }

      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Erro ao carregar categorias")
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (name: string) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    if (!subjectId) {
      toast.error("Matéria não selecionada")
      return
    }

    if (!name.trim()) {
      toast.error("Nome da categoria é obrigatório")
      return
    }

    try {
      const newCategory = {
        name: name.trim(),
        subject_id: subjectId,
        user_id: user.id,
      }

      const { data, error } = await supabase
        .from("subject_categories")
        .insert([newCategory])
        .select()
        .single()

      if (error) {
        console.error("Error adding category:", error)
        toast.error("Erro ao adicionar categoria")
        return
      }

      setCategories(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error("Error adding category:", error)
      toast.error("Erro ao adicionar categoria")
    }
  }

  const updateCategory = async (id: string, name: string) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    if (!id) {
      toast.error("Categoria não encontrada")
      return
    }

    if (!name.trim()) {
      toast.error("Nome da categoria é obrigatório")
      return
    }

    try {
      const { error } = await supabase
        .from("subject_categories")
        .update({ name: name.trim() })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating category:", error)
        toast.error("Erro ao atualizar categoria")
        return
      }

      setCategories(prev => 
        prev.map(category => 
          category.id === id ? { ...category, name: name.trim() } : category
        )
      )
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error("Erro ao atualizar categoria")
    }
  }

  const deleteCategory = async (id: string) => {
    if (!user) {
      toast.error("Usuário não autenticado")
      return
    }

    if (!id) {
      toast.error("Categoria não encontrada")
      return
    }

    try {
      const { error } = await supabase
        .from("subject_categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error deleting category:", error)
        toast.error("Erro ao remover categoria")
        return
      }

      setCategories(prev => prev.filter(category => category.id !== id))
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Erro ao remover categoria")
    }
  }

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
