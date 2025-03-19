'use client'

import { useEffect } from 'react'
import { useEventSources } from '@/hooks/useEventSources'
import { useOnboardingContext } from './onboarding-provider'

export function EventSourceDetector() {
  const { sources, loading: sourcesLoading } = useEventSources()
  const { progress, markStepCompleted, loading: onboardingLoading } = useOnboardingContext()

  useEffect(() => {
    // Verificar se já existe pelo menos uma origem de evento e marcar o passo como concluído
    if (
      !sourcesLoading && 
      !onboardingLoading && 
      progress && 
      !progress.configured_event_source && 
      sources.length > 0
    ) {
      markStepCompleted('configured_event_source')
    }
  }, [sources, sourcesLoading, progress, onboardingLoading, markStepCompleted])

  // Este componente não renderiza nada visualmente
  return null
}
