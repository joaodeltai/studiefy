'use client'

import { useEffect } from 'react'
import { useGrades } from '@/hooks/useGrades'
import { useOnboardingContext } from './onboarding-provider'

export function GradeDetector() {
  const { events, loading: gradesLoading } = useGrades()
  const { progress, markStepCompleted, loading: onboardingLoading } = useOnboardingContext()

  useEffect(() => {
    // Verificar se já existe pelo menos um evento com nota e marcar o passo como concluído
    if (
      !gradesLoading && 
      !onboardingLoading && 
      progress && 
      !progress.added_grade && 
      progress.created_event && // Só marcar se o passo anterior foi concluído
      events.length > 0
    ) {
      // Verificar se pelo menos um evento tem nota ou nota de redação
      const hasGrade = events.some(event => 
        (event.grade !== null && event.grade !== undefined) || 
        (event.essay_grade !== null && event.essay_grade !== undefined)
      )
      
      if (hasGrade) {
        markStepCompleted('added_grade')
      }
    }
  }, [events, gradesLoading, progress, onboardingLoading, markStepCompleted])

  // Este componente não renderiza nada visualmente
  return null
}
