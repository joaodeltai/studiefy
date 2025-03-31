"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"
import { usePlanLimits, FREE_PLAN_LIMITS } from "./usePlanLimits"
import { toast } from "sonner"

export interface FlashcardDeck {
  id: string
  title: string
  description: string | null
  subject_id: string | null
  user_id: string
  created_at: string
  updated_at: string
  deleted: boolean
}

export interface FlashcardDeckError extends Error {
  code: string
}

export function useFlashcardDecks(subjectId?: string) {
  const [decks, setDecks] = useState<FlashcardDeck[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { isPremium } = usePlanLimits()

  useEffect(() => {
    if (user) {
      fetchDecks();
    }
  }, [user, subjectId])

  const fetchDecks = async () => {
    if (!user) return;

    try {
      setLoading(true)
      let query = supabase
        .from("flashcard_decks")
        .select("*")
        .eq("user_id", user?.id)
        .eq("deleted", false)

      // Se um subjectId for fornecido, filtra por ele
      if (subjectId) {
        query = query.eq("subject_id", subjectId)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setDecks(data || []);
    } catch (error) {
      console.error("Erro ao buscar decks de flashcards:", error)
    } finally {
      setLoading(false)
    }
  }

  const addDeck = async (title: string, description: string | null = null, deckSubjectId: string | null = null) => {
    try {
      // Verifica se o usuário já atingiu o limite de decks do plano Free
      if (!isPremium && decks.length >= FREE_PLAN_LIMITS.MAX_FLASHCARD_DECKS) {
        const error = new Error(`Você atingiu o limite de ${FREE_PLAN_LIMITS.MAX_FLASHCARD_DECKS} decks de flashcards do plano Free. Faça upgrade para o plano Premium para adicionar mais decks.`) as FlashcardDeckError;
        error.code = 'PLAN_LIMIT_REACHED';
        throw error;
      }

      const newDeck = {
        title,
        description,
        subject_id: deckSubjectId || subjectId || null,
        user_id: user?.id,
      }

      const { data, error } = await supabase
        .from("flashcard_decks")
        .insert([newDeck])
        .select()
        .single()

      if (error) {
        throw error
      }

      const updatedDecks = [data, ...decks];
      setDecks(updatedDecks);
      return data
    } catch (error: any) {
      console.error("Erro ao adicionar deck de flashcards:", error)
      
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

  const deleteDeck = async (id: string) => {
    try {
      // Soft delete - apenas marca como excluído
      const { error } = await supabase
        .from("flashcard_decks")
        .update({ deleted: true })
        .eq("id", id)
        .eq("user_id", user?.id)

      if (error) {
        throw error
      }

      const updatedDecks = decks.filter((deck) => deck.id !== id);
      setDecks(updatedDecks);
    } catch (error) {
      console.error("Erro ao excluir deck de flashcards:", error)
      throw error
    }
  }

  const updateDeck = async (id: string, title: string, description: string | null = null, deckSubjectId: string | null = null) => {
    try {
      const { data, error } = await supabase
        .from("flashcard_decks")
        .update({ 
          title, 
          description,
          subject_id: deckSubjectId || subjectId || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .eq("user_id", user?.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      const updatedDecks = decks.map((deck) => 
        deck.id === id ? { ...deck, title, description, subject_id: deckSubjectId || subjectId || null } : deck
      );
      setDecks(updatedDecks);
      return data
    } catch (error) {
      console.error("Erro ao atualizar deck de flashcards:", error)
      throw error
    }
  }

  // Recupera um deck específico pelo ID
  const getDeckById = (id: string) => {
    return decks.find(deck => deck.id === id) || null;
  }

  // Calcula se o usuário atingiu o limite de decks
  const hasReachedLimit = !isPremium && decks.length >= FREE_PLAN_LIMITS.MAX_FLASHCARD_DECKS
  
  // Calcula quantos decks ainda podem ser criados
  const remainingDecksCount = isPremium ? Infinity : Math.max(0, FREE_PLAN_LIMITS.MAX_FLASHCARD_DECKS - decks.length)

  return {
    decks,
    loading,
    addDeck,
    deleteDeck,
    updateDeck,
    getDeckById,
    refreshDecks: fetchDecks,
    hasReachedLimit,
    remainingDecks: remainingDecksCount
  }
}
