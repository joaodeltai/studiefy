'use client'

import { useEffect } from 'react'
import { useSubjects } from '@/hooks/useSubjects'
import { useOnboardingContext } from './onboarding-provider'

export function SubjectDetector() {
  const { subjects, loading: subjectsLoading } = useSubjects()
  const { progress, markStepCompleted, loading: onboardingLoading } = useOnboardingContext()

  useEffect(() => {
    // Verificar se já existe pelo menos uma matéria e marcar o passo como concluído
    if (
      !subjectsLoading && 
      !onboardingLoading && 
      progress && 
      !progress.created_subject && 
      subjects.length > 0
    ) {
      markStepCompleted('created_subject')
    }
  }, [subjects, subjectsLoading, progress, onboardingLoading, markStepCompleted])

  // Este componente não renderiza nada visualmente
  return null
}
