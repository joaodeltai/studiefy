'use client'

import { useEffect } from 'react'
import { useAllContents } from '@/hooks/useAllContents'
import { useOnboardingContext } from './onboarding-provider'

export function ContentDetector() {
  const { contents, loading: contentsLoading } = useAllContents()
  const { progress, markStepCompleted, loading: onboardingLoading } = useOnboardingContext()

  useEffect(() => {
    // Verificar se já existe pelo menos um conteúdo e marcar o passo como concluído
    if (
      !contentsLoading && 
      !onboardingLoading && 
      progress && 
      !progress.created_content && 
      progress.created_subject && // Só marcar se o passo anterior foi concluído
      contents.length > 0
    ) {
      markStepCompleted('created_content')
    }
  }, [contents, contentsLoading, progress, onboardingLoading, markStepCompleted])

  // Este componente não renderiza nada visualmente
  return null
}
