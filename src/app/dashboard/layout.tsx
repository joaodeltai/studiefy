'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { cn } from "@/lib/utils"
import { TrialBanner } from "@/components/ui/trial-banner"
import { useTrialStatus } from "@/hooks/useTrialStatus"
import { OnboardingSystem } from "@/components/onboarding/onboarding-system"
import { GlobalHeader } from "@/components/global/GlobalHeader"
import { PageTitleProvider } from "@/contexts/PageTitleContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(false)
  const { isTrialing, daysRemaining, isExpired } = useTrialStatus()

  // Detecta se é dispositivo móvel para ajustes de layout
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
    }
    
    // Verifica inicialmente
    checkIfMobile()
    
    // Adiciona listener para redimensionamento
    window.addEventListener('resize', checkIfMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  return (
    <PageTitleProvider>
      <div className="h-full relative bg-white overflow-hidden">
        {/* Sidebar container - apenas para desktop */}
        <div className="hidden h-full md:flex md:fixed md:inset-y-0 z-[80] px-3" style={{ width: '80px' }}>
          <Sidebar />
        </div>
        
        {/* Header mobile - aplicado apenas em telas pequenas */}
        <MobileHeader />

        {/* Main content */}
        {/* Header global para desktop */}
        <div className="hidden md:block">
          <GlobalHeader isSidebarCollapsed={true} />
        </div>
        
        <main 
          className="h-full overflow-y-auto overflow-x-hidden md:pt-0"
          style={{ 
            marginLeft: isMobile ? '0' : '80px',
            width: isMobile ? '100%' : 'calc(100% - 80px)',
            maxWidth: '100vw',
            paddingTop: isMobile ? '40px' : '80px' // 80px é a altura do header fixo (h-20)
          }}
        >
          
          <div className="w-full max-w-full p-4 sm:p-6">
            {/* Banner de trial */}
            <TrialBanner 
              isTrialing={isTrialing} 
              daysRemaining={daysRemaining} 
              isExpired={isExpired} 
            />
            
            {children}
          </div>
        </main>

        {/* Sistema de Onboarding */}
        <OnboardingSystem />
      </div>
    </PageTitleProvider>
  )
}
