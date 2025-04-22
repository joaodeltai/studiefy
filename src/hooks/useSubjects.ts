"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"
import { usePlanLimits, FREE_PLAN_LIMITS } from "./usePlanLimits"
import { toast } from "sonner"

export interface Subject {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export interface SubjectError extends Error {
  code: string
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { isPremium, hasReachedSubjectsLimit } = usePlanLimits()

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user])

  const fetchSubjects = async () => {
    if (!user) return;

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error)
    } finally {
      setLoading(false)
    }
  }

  const addSubject = async (name: string, color: string) => {
    try {
      // Verifica se o usuário já atingiu o limite de matérias do plano Free
      if (!isPremium && subjects.length >= FREE_PLAN_LIMITS.MAX_SUBJECTS) {
        const error = new Error(`Você atingiu o limite de ${FREE_PLAN_LIMITS.MAX_SUBJECTS} matérias do plano Free. Faça upgrade para o plano Premium para adicionar mais matérias.`) as SubjectError;
        error.code = 'PLAN_LIMIT_REACHED';
        throw error;
      }

      const newSubject = {
        name,
        color,
        user_id: user?.id,
      }

      const { data, error } = await supabase
        .from("subjects")
        .insert([newSubject])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Atualiza o estado local com a nova matéria
      // Importante: Criamos um novo array em vez de modificar o existente
      setSubjects(prevSubjects => [data, ...prevSubjects]);
      
      // Força uma nova busca das matérias do banco de dados para garantir sincronização
      setTimeout(() => {
        fetchSubjects();
      }, 300);
      
      return data
    } catch (error: any) {
      console.error("Error adding subject:", error)
      
      // Se for erro de limite do plano, exibe um toast específico
      if (error.code === 'PLAN_LIMIT_REACHED') {
        toast.error(error.message, {
          description: "Acesse a página de assinatura para fazer upgrade.",
          action: {
            label: "Ver planos",
            onClick: () => window.location.href = "/dashboard/subscription"
          }
        });
      }
      
      throw error
    }
  }

  const deleteSubject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id)

      if (error) {
        throw error
      }

      const updatedSubjects = subjects.filter((subject) => subject.id !== id);
      setSubjects(updatedSubjects);
    } catch (error) {
      console.error("Error deleting subject:", error)
      throw error
    }
  }

  const updateSubject = async (id: string, name: string, color: string) => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .update({ name, color })
        .eq("id", id)
        .eq("user_id", user?.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      const updatedSubjects = subjects.map((subject) => 
        subject.id === id ? { ...subject, name, color } : subject
      );
      setSubjects(updatedSubjects);
      return data
    } catch (error) {
      console.error("Error updating subject:", error)
      throw error
    }
  }

  // Calcula hasReachedLimit utilizando o hook usePlanLimits com a contagem atual
  const hasReachedLimit = hasReachedSubjectsLimit(subjects.length)
  // Calcula remainingSubjects usando subjects.length ao invés de um valor armazenado no usePlanLimits
  const remainingSubjectsCount = isPremium ? Infinity : Math.max(0, FREE_PLAN_LIMITS.MAX_SUBJECTS - subjects.length)

  return {
    subjects,
    loading,
    addSubject,
    deleteSubject,
    updateSubject,
    refreshSubjects: async () => {
      // Aguarda um pequeno intervalo para garantir que as operações de banco de dados sejam concluídas
      await new Promise(resolve => setTimeout(resolve, 300));
      return fetchSubjects();
    },
    hasReachedLimit,
    remainingSubjects: remainingSubjectsCount
  }
}
