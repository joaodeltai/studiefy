'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

// Tipo para o progresso do onboarding
export type OnboardingProgress = {
  id: string
  user_id: string
  created_subject: boolean
  created_content: boolean
  created_event: boolean
  added_grade: boolean
  added_error_entry: boolean
  visited_review: boolean
  configured_event_source: boolean
  visited_grades: boolean
  visited_flashcards: boolean
  is_completed: boolean
  created_at: string
  updated_at: string
}

export function useOnboarding() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [minimized, setMinimized] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Buscar o progresso do onboarding do usuário
  useEffect(() => {
    const fetchOnboardingProgress = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Verificar se o usuário já tem um registro de onboarding
        const { data, error } = await supabase
          .from('onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar progresso do onboarding:', error)
          return
        }
        
        // Se o usuário não tem um registro, criar um novo
        if (!data) {
          const newProgress = {
            user_id: user.id,
            created_subject: false,
            created_content: false,
            created_event: false,
            added_grade: false,
            added_error_entry: false,
            visited_review: false,
            configured_event_source: false,
            visited_grades: false,
            visited_flashcards: false,
            is_completed: false,
          }
          
          const { data: newData, error: insertError } = await supabase
            .from('onboarding')
            .insert(newProgress)
            .select()
            .single()
          
          if (insertError) {
            console.error('Erro ao criar progresso do onboarding:', insertError)
            return
          }
          
          setProgress(newData)
        } else {
          setProgress(data)
        }
        
        // Carregar o estado minimizado do localStorage
        if (typeof window !== 'undefined') {
          const savedMinimizedState = localStorage.getItem('onboarding_minimized')
          if (savedMinimizedState) {
            setMinimized(savedMinimizedState === 'true')
          }
        }
      } catch (error) {
        console.error('Erro ao buscar progresso do onboarding:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchOnboardingProgress()
    }
  }, [user])

  // Função para atualizar o estado de um passo (marcar ou desmarcar)
  const updateStepStatus = async (step: keyof OnboardingProgress, value: boolean) => {
    if (!user || !progress) return
    
    try {
      // Verificar se o campo existe no objeto de progresso
      if (!(step in progress)) {
        console.warn(`O campo ${step} não existe no objeto de progresso do onboarding.`)
        return
      }
      
      // Criar uma cópia do progresso atual
      const updatedProgress = { ...progress }
      
      // Atualizar o valor do passo
      // @ts-ignore - Ignorar erro de tipagem, pois já verificamos que o campo existe
      updatedProgress[step] = value
      
      // Atualizar o estado local para feedback imediato
      setProgress(updatedProgress)
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('onboarding')
        .update({
          [step]: value,
          is_completed: false, // Sempre que um passo é alterado, o onboarding não está mais completo
          updated_at: new Date().toISOString()
        })
        .eq('id', progress.id)
      
      if (error) {
        console.error(`Erro ao atualizar passo ${step}:`, error)
        // Reverter o estado local em caso de erro
        setProgress((prev) => {
          if (!prev) return null
          return { ...prev, [step]: !value }
        })
        return
      }
      
      // Verificar se todos os passos foram concluídos
      const allStepsCompleted = 
        updatedProgress.created_subject &&
        updatedProgress.created_content &&
        updatedProgress.created_event &&
        updatedProgress.added_grade &&
        updatedProgress.added_error_entry &&
        updatedProgress.visited_review &&
        updatedProgress.configured_event_source &&
        updatedProgress.visited_grades
        // visited_flashcards foi removido temporariamente até que a coluna seja adicionada no banco de dados
      
      // Se todos os passos foram concluídos, marcar o onboarding como concluído
      if (allStepsCompleted) {
        const { error: completeError } = await supabase
          .from('onboarding')
          .update({ is_completed: true, updated_at: new Date().toISOString() })
          .eq('id', progress.id)
        
        if (completeError) {
          console.error('Erro ao marcar onboarding como concluído:', completeError)
          return
        }
        
        setProgress((prev) => {
          if (!prev) return null
          return { ...prev, is_completed: true }
        })

        // Mostrar a celebração quando todos os passos forem concluídos
        setShowCelebration(true)
      }
    } catch (error) {
      console.error(`Erro ao atualizar passo ${step}:`, error)
    }
  }

  // Função para marcar um passo como concluído
  const markStepCompleted = async (step: keyof OnboardingProgress) => {
    return updateStepStatus(step, true)
  }

  // Função para desmarcar um passo
  const unmarkStep = async (step: keyof OnboardingProgress) => {
    return updateStepStatus(step, false)
  }

  // Função para alternar o estado minimizado
  const toggleMinimized = () => {
    const newState = !minimized
    setMinimized(newState)
    
    // Salvar o estado no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_minimized', newState.toString())
    }
  }

  // Função para fechar a celebração
  const closeCelebration = () => {
    setShowCelebration(false)
  }

  return {
    progress,
    loading,
    minimized,
    showCelebration,
    toggleMinimized,
    markStepCompleted,
    unmarkStep,
    closeCelebration,
  }
}
