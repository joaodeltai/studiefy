"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useState, useCallback } from "react"
import { FSRSManager } from "@/lib/fsrs"
import { addDays, differenceInDays } from "date-fns"

// Tipos para o algoritmo FSRS
export type Rating = 1 | 2 | 3 | 4 // 1: Esqueci, 2: Difícil, 3: Bom, 4: Fácil
export type State = 0 | 1 | 2 | 3 // 0: novo, 1: aprendendo, 2: revisão, 3: reaprendendo

// Interface para o estado de um flashcard no FSRS
export interface FlashcardState {
  id: string
  flashcard_id: string
  user_id: string
  stability: number
  difficulty: number
  next_due_date: string | null
  last_review_date: string | null
  state: State
  lapses: number
  reps: number
  created_at: string
  updated_at: string
}

// Interface para o histórico de revisões
export interface FlashcardReview {
  id: string
  flashcard_id: string
  user_id: string
  rating: Rating
  scheduled_days: number
  actual_days: number | null
  review_date: string
  created_at: string
}

// Parâmetros do algoritmo FSRS
const defaultParameters = {
  request_retention: 0.9,
  maximum_interval: 36500,
  w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
};

export function useFSRS() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  
  // Inicializa o algoritmo FSRS
  const fsrs = new FSRSManager();

  // Função para buscar o estado atual de um flashcard
  const getFlashcardState = useCallback(async (flashcardId: string) => {
    if (!user || !flashcardId) return null;

    try {
      const { data, error } = await supabase
        .from("flashcard_states")
        .select("*")
        .eq("flashcard_id", flashcardId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar estado do flashcard:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar estado do flashcard:", error);
      return null;
    }
  }, [user]);

  // Função para buscar flashcards que precisam ser revisados hoje
  const getDueFlashcards = useCallback(async (deckId: string) => {
    if (!user || !deckId) return [];

    try {
      setLoading(true);
      
      // Busca todos os flashcards do deck que não estão excluídos
      const { data: flashcardsData, error: flashcardsError } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", deckId)
        .eq("user_id", user.id)
        .eq("deleted", false);

      if (flashcardsError) {
        throw flashcardsError;
      }

      if (!flashcardsData || flashcardsData.length === 0) {
        return [];
      }

      const flashcardIds = flashcardsData.map(f => f.id);

      // Busca os estados dos flashcards
      const { data: statesData, error: statesError } = await supabase
        .from("flashcard_states")
        .select("*")
        .in("flashcard_id", flashcardIds)
        .eq("user_id", user.id);

      if (statesError) {
        throw statesError;
      }

      // Hoje à meia-noite
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filtra os flashcards que precisam ser revisados hoje
      // Inclui flashcards novos (state = 0) ou com data de revisão <= hoje
      const dueFlashcards = flashcardsData.filter(flashcard => {
        const state = statesData?.find(s => s.flashcard_id === flashcard.id);
        
        // Se não tem estado, é um flashcard novo
        if (!state) return true;
        
        // Se é novo (state = 0), deve ser revisado
        if (state.state === 0) return true;
        
        // Se tem data de revisão e é <= hoje, deve ser revisado
        if (state.next_due_date) {
          const dueDate = new Date(state.next_due_date);
          return dueDate <= today;
        }
        
        return false;
      });

      return dueFlashcards;
    } catch (error) {
      console.error("Erro ao buscar flashcards para revisão:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Função para registrar uma revisão e atualizar o estado do flashcard
  const recordReview = useCallback(async (flashcardId: string, rating: Rating) => {
    if (!user || !flashcardId) return null;

    try {
      setLoading(true);
      
      // Busca o estado atual do flashcard
      const currentState = await getFlashcardState(flashcardId);
      
      // Se não existe estado, cria um novo
      if (!currentState) {
        // Cria um novo estado para o flashcard
        const newState = {
          flashcard_id: flashcardId,
          user_id: user.id,
          stability: 0,
          difficulty: 0,
          state: 0 as State, // novo
          lapses: 0,
          reps: 0
        };
        
        const { data: createdState, error: createError } = await supabase
          .from("flashcard_states")
          .insert([newState])
          .select()
          .single();
          
        if (createError) {
          throw createError;
        }
        
        // Continua com o estado recém-criado
        return await processReview(createdState, rating);
      }
      
      // Continua com o estado existente
      return await processReview(currentState, rating);
      
    } catch (error) {
      console.error("Erro ao registrar revisão:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, getFlashcardState]);
  
  // Função interna para processar a revisão e atualizar o estado
  const processReview = async (state: FlashcardState, rating: Rating) => {
    try {
      const now = new Date();
      
      // Calcula os dias desde a última revisão
      let actualDays = 0;
      if (state.last_review_date) {
        const lastReviewDate = new Date(state.last_review_date);
        actualDays = differenceInDays(now, lastReviewDate) || 0;
      }
      
      // Prepara os dados para o algoritmo FSRS
      const card = {
        due: now,
        stability: state.stability,
        difficulty: state.difficulty,
        elapsed_days: actualDays,
        scheduled_days: state.next_due_date ? differenceInDays(new Date(state.next_due_date), new Date(state.last_review_date || state.created_at)) : 0,
        reps: state.reps,
        lapses: state.lapses,
        state: state.state,
      };
      
      // Calcula o novo estado com o algoritmo FSRS
      const result = fsrs.repeat(card, now, rating);
      
      // Prepara os dados para atualizar no banco
      const updatedState = {
        stability: result.card.stability,
        difficulty: result.card.difficulty,
        next_due_date: result.card.due.toISOString(),
        last_review_date: now.toISOString(),
        state: result.card.state as State,
        lapses: result.card.lapses,
        reps: result.card.reps + 1,
        updated_at: now.toISOString()
      };
      
      // Registra a revisão no histórico
      const reviewRecord = {
        flashcard_id: state.flashcard_id,
        user_id: user?.id,
        rating,
        scheduled_days: card.scheduled_days,
        actual_days: actualDays,
        review_date: now.toISOString()
      };
      
      // Atualiza o estado do flashcard
      const { error: updateError } = await supabase
        .from("flashcard_states")
        .update(updatedState)
        .eq("id", state.id)
        .eq("user_id", user?.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Registra a revisão no histórico
      const { data: reviewData, error: reviewError } = await supabase
        .from("flashcard_reviews")
        .insert([reviewRecord])
        .select()
        .single();
        
      if (reviewError) {
        throw reviewError;
      }
      
      // Retorna o resultado da revisão
      return {
        nextDueDate: result.card.due,
        interval: result.card.scheduled_days,
        state: result.card.state,
        review: reviewData
      };
      
    } catch (error) {
      console.error("Erro ao processar revisão:", error);
      return null;
    }
  };
  
  // Função para buscar estatísticas de revisão de um deck
  const getDeckStats = useCallback(async (deckId: string) => {
    if (!user || !deckId) return null;

    try {
      // Busca todos os flashcards do deck
      const { data: flashcardsData, error: flashcardsError } = await supabase
        .from("flashcards")
        .select("id")
        .eq("deck_id", deckId)
        .eq("user_id", user.id)
        .eq("deleted", false);

      if (flashcardsError) {
        throw flashcardsError;
      }

      if (!flashcardsData || flashcardsData.length === 0) {
        return {
          total: 0,
          new: 0,
          learning: 0,
          review: 0,
          relearning: 0,
          dueToday: 0
        };
      }

      const flashcardIds = flashcardsData.map(f => f.id);

      // Busca os estados dos flashcards
      const { data: statesData, error: statesError } = await supabase
        .from("flashcard_states")
        .select("*")
        .in("flashcard_id", flashcardIds)
        .eq("user_id", user.id);

      if (statesError) {
        throw statesError;
      }

      // Hoje à meia-noite
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calcula as estatísticas
      let newCount = 0;
      let learningCount = 0;
      let reviewCount = 0;
      let relearningCount = 0;
      let dueTodayCount = 0;

      // Flashcards sem estado são considerados novos
      const flashcardsWithState = statesData?.length || 0;
      newCount = flashcardsData.length - flashcardsWithState;

      // Conta os flashcards por estado
      statesData?.forEach(state => {
        if (state.state === 0) newCount++;
        else if (state.state === 1) learningCount++;
        else if (state.state === 2) reviewCount++;
        else if (state.state === 3) relearningCount++;

        // Verifica se está vencido hoje
        if (state.next_due_date) {
          const dueDate = new Date(state.next_due_date);
          if (dueDate <= today) {
            dueTodayCount++;
          }
        } else if (state.state === 0) {
          // Flashcards novos também são considerados vencidos hoje
          dueTodayCount++;
        }
      });

      return {
        total: flashcardsData.length,
        new: newCount,
        learning: learningCount,
        review: reviewCount,
        relearning: relearningCount,
        dueToday: dueTodayCount
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas do deck:", error);
      return null;
    }
  }, [user]);

  return {
    loading,
    getFlashcardState,
    getDueFlashcards,
    recordReview,
    getDeckStats
  };
}
