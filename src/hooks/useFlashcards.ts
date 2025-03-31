"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"
import { usePlanLimits, FREE_PLAN_LIMITS } from "./usePlanLimits"
import { toast } from "sonner"

export interface Flashcard {
  id: string
  deck_id: string
  front: string
  back: string
  user_id: string
  created_at: string
  updated_at: string
  deleted: boolean
}

export interface FlashcardError extends Error {
  code: string
}

export function useFlashcards(deckId: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { isPremium } = usePlanLimits()

  useEffect(() => {
    if (user && deckId) {
      fetchFlashcards();
    }
  }, [user, deckId])

  const fetchFlashcards = async () => {
    if (!user || !deckId) return;

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user?.id)
        .eq("deck_id", deckId)
        .eq("deleted", false)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setFlashcards(data || []);
    } catch (error) {
      console.error("Erro ao buscar flashcards:", error)
    } finally {
      setLoading(false)
    }
  }

  const addFlashcard = async (front: string, back: string) => {
    try {
      // Verifica se o usuário já atingiu o limite de flashcards do plano Free
      if (!isPremium && flashcards.length >= FREE_PLAN_LIMITS.MAX_FLASHCARDS_PER_DECK) {
        const error = new Error(`Você atingiu o limite de ${FREE_PLAN_LIMITS.MAX_FLASHCARDS_PER_DECK} flashcards por deck no plano Free. Faça upgrade para o plano Premium para adicionar mais flashcards.`) as FlashcardError;
        error.code = 'PLAN_LIMIT_REACHED';
        throw error;
      }

      const newFlashcard = {
        front,
        back,
        deck_id: deckId,
        user_id: user?.id,
      }

      const { data, error } = await supabase
        .from("flashcards")
        .insert([newFlashcard])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Cria o estado inicial do flashcard no FSRS
      await supabase
        .from("flashcard_states")
        .insert([{
          flashcard_id: data.id,
          user_id: user?.id,
          stability: 0,
          difficulty: 0,
          state: 0, // 0: novo
          lapses: 0,
          reps: 0
        }])

      const updatedFlashcards = [data, ...flashcards];
      setFlashcards(updatedFlashcards);
      return data
    } catch (error: any) {
      console.error("Erro ao adicionar flashcard:", error)
      
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

  const deleteFlashcard = async (id: string) => {
    try {
      // Soft delete - apenas marca como excluído
      const { error } = await supabase
        .from("flashcards")
        .update({ deleted: true })
        .eq("id", id)
        .eq("user_id", user?.id)

      if (error) {
        throw error
      }

      const updatedFlashcards = flashcards.filter((flashcard) => flashcard.id !== id);
      setFlashcards(updatedFlashcards);
    } catch (error) {
      console.error("Erro ao excluir flashcard:", error)
      throw error
    }
  }

  const updateFlashcard = async (id: string, front: string, back: string) => {
    try {
      const { data, error } = await supabase
        .from("flashcards")
        .update({ 
          front, 
          back,
          updated_at: new Date().toISOString() 
        })
        .eq("id", id)
        .eq("user_id", user?.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      const updatedFlashcards = flashcards.map((flashcard) => 
        flashcard.id === id ? { ...flashcard, front, back } : flashcard
      );
      setFlashcards(updatedFlashcards);
      return data
    } catch (error) {
      console.error("Erro ao atualizar flashcard:", error)
      throw error
    }
  }

  // Recupera um flashcard específico pelo ID
  const getFlashcardById = (id: string) => {
    return flashcards.find(flashcard => flashcard.id === id) || null;
  }

  // Calcula se o usuário atingiu o limite de flashcards por deck
  const hasReachedLimit = !isPremium && flashcards.length >= FREE_PLAN_LIMITS.MAX_FLASHCARDS_PER_DECK
  
  // Calcula quantos flashcards ainda podem ser criados
  const remainingFlashcardsCount = isPremium ? Infinity : Math.max(0, FREE_PLAN_LIMITS.MAX_FLASHCARDS_PER_DECK - flashcards.length)

  return {
    flashcards,
    loading,
    addFlashcard,
    deleteFlashcard,
    updateFlashcard,
    getFlashcardById,
    refreshFlashcards: fetchFlashcards,
    hasReachedLimit,
    remainingFlashcards: remainingFlashcardsCount
  }
}
