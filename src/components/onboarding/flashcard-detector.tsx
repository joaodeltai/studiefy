'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useOnboardingContext } from './onboarding-provider'

export function FlashcardDetector() {
  const { progress, markStepCompleted, loading: onboardingLoading } = useOnboardingContext()
  const pathname = usePathname()
  
  useEffect(() => {
    // Verificar se estamos na página de flashcards
    if (
      pathname === '/dashboard/flashcards' && 
      !onboardingLoading && 
      progress && 
      !progress.visited_flashcards
    ) {
      markStepCompleted('visited_flashcards')
    }
  }, [pathname, progress, onboardingLoading, markStepCompleted])
  
  return null
}
