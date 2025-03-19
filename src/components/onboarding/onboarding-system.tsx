'use client'

import { OnboardingProvider } from './onboarding-provider'
import { OnboardingChecklist } from './onboarding-checklist'
import { OnboardingCelebration } from './onboarding-celebration'
import { useOnboardingContext } from './onboarding-provider'

// Componente interno que usa o contexto
function OnboardingContent() {
  const { showCelebration, closeCelebration } = useOnboardingContext()
  
  return (
    <>
      {/* Checklist visível para o usuário */}
      <OnboardingChecklist />
      <OnboardingCelebration 
        open={showCelebration} 
        onClose={closeCelebration} 
      />
    </>
  )
}

// Componente principal que fornece o contexto
export function OnboardingSystem() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  )
}
