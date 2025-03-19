'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useOnboarding, OnboardingProgress } from '@/hooks/useOnboarding'

interface OnboardingContextType {
  progress: OnboardingProgress | null
  loading: boolean
  minimized: boolean
  showCelebration: boolean
  toggleMinimized: () => void
  markStepCompleted: (step: keyof OnboardingProgress) => Promise<void>
  unmarkStep: (step: keyof OnboardingProgress) => Promise<void>
  closeCelebration: () => void
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function useOnboardingContext() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider')
  }
  return context
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const onboarding = useOnboarding()

  return (
    <OnboardingContext.Provider value={onboarding}>
      {children}
    </OnboardingContext.Provider>
  )
}
