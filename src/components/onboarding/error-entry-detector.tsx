'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useOnboardingContext } from './onboarding-provider'
import { useState } from 'react'

export function ErrorEntryDetector() {
  const { user } = useAuth()
  const [hasErrorEntries, setHasErrorEntries] = useState(false)
  const [loading, setLoading] = useState(true)
  const { progress, markStepCompleted, loading: onboardingLoading } = useOnboardingContext()

  useEffect(() => {
    const checkErrorEntries = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('error_entries')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
        
        if (error) {
          console.error('Erro ao verificar entradas de erro:', error)
          return
        }
        
        setHasErrorEntries(data && data.length > 0)
      } catch (error) {
        console.error('Erro ao verificar entradas de erro:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      checkErrorEntries()
    }
  }, [user])

  useEffect(() => {
    // Verificar se já existe pelo menos uma entrada no caderno de erros e marcar o passo como concluído
    if (
      !loading && 
      !onboardingLoading && 
      progress && 
      !progress.added_error_entry && 
      progress.created_event && // Só marcar se o passo anterior foi concluído
      hasErrorEntries
    ) {
      markStepCompleted('added_error_entry')
    }
  }, [hasErrorEntries, loading, progress, onboardingLoading, markStepCompleted])

  // Este componente não renderiza nada visualmente
  return null
}
