'use client'

import { useEffect } from 'react'
import { useAllEvents } from '@/hooks/useAllEvents'
import { useOnboardingContext } from './onboarding-provider'

export function EventDetector() {
  const { events, loading: eventsLoading } = useAllEvents()
  const { progress, markStepCompleted, loading: onboardingLoading } = useOnboardingContext()

  useEffect(() => {
    // Verificar se já existe pelo menos um evento e marcar o passo como concluído
    if (
      !eventsLoading && 
      !onboardingLoading && 
      progress && 
      !progress.created_event && 
      events.length > 0
    ) {
      markStepCompleted('created_event')
    }
  }, [events, eventsLoading, progress, onboardingLoading, markStepCompleted])

  // Este componente não renderiza nada visualmente
  return null
}
