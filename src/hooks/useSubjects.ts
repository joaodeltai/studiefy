"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"
import { usePlanLimits, FREE_PLAN_LIMITS } from "./usePlanLimits"
import { toast } from "sonner"

// Chave para o cache de matérias no localStorage
const SUBJECTS_CACHE_KEY = 'studiefy:subjects:cache';
// Tempo de expiração do cache em milissegundos (15 minutos)
const CACHE_EXPIRATION_TIME = 15 * 60 * 1000;

export interface Subject {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

// Interface para o objeto de cache
interface SubjectsCache {
  subjects: Subject[];
  timestamp: number;
  userId: string;
}

export interface SubjectError extends Error {
  code: string
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { isPremium, hasReachedSubjectsLimit } = usePlanLimits()

  // Função para salvar o cache no localStorage
  const saveSubjectsCache = (subjectsData: Subject[]) => {
    try {
      if (!user) return;
      
      const cacheData: SubjectsCache = {
        subjects: subjectsData,
        timestamp: Date.now(),
        userId: user.id
      };
      
      localStorage.setItem(SUBJECTS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erro ao salvar cache de matérias:', error);
    }
  };

  // Função para carregar o cache do localStorage
  const loadSubjectsCache = (): SubjectsCache | null => {
    try {
      if (!user) return null;
      
      const cachedData = localStorage.getItem(SUBJECTS_CACHE_KEY);
      
      if (!cachedData) return null;
      
      const parsedCache = JSON.parse(cachedData) as SubjectsCache;
      
      // Verificar se o cache pertence ao usuário atual
      if (parsedCache.userId !== user.id) {
        localStorage.removeItem(SUBJECTS_CACHE_KEY);
        return null;
      }
      
      // Verificar se o cache está expirado
      if (Date.now() - parsedCache.timestamp > CACHE_EXPIRATION_TIME) {
        localStorage.removeItem(SUBJECTS_CACHE_KEY);
        return null;
      }
      
      return parsedCache;
    } catch (error) {
      console.error('Erro ao carregar cache de matérias:', error);
      return null;
    }
  };

  // Função para limpar o cache de matérias
  const clearSubjectsCache = () => {
    try {
      localStorage.removeItem(SUBJECTS_CACHE_KEY);
    } catch (error) {
      console.error('Erro ao remover cache de matérias:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user])

  const fetchSubjects = async (forceRefresh = false) => {
    if (!user) return;

    // Se não for forçado a atualizar, verifique o cache primeiro
    if (!forceRefresh) {
      const cachedData = loadSubjectsCache();
      if (cachedData) {
        setSubjects(cachedData.subjects);
        setLoading(false);
        return;
      }
    } else {
      // Se forçar atualização, limpe o cache atual
      clearSubjectsCache();
    }

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

      const subjectsData = data || [];
      setSubjects(subjectsData);
      saveSubjectsCache(subjectsData);
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

      const updatedSubjects = [data, ...subjects];
      setSubjects(updatedSubjects);
      saveSubjectsCache(updatedSubjects);
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
      saveSubjectsCache(updatedSubjects);
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
      saveSubjectsCache(updatedSubjects);
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
    refreshSubjects: (force = false) => fetchSubjects(force),
    hasReachedLimit,
    remainingSubjects: remainingSubjectsCount
  }
}
