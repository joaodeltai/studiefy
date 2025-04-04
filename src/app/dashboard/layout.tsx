'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { Button } from "@/components/ui/button"
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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isTrialing, daysRemaining, isExpired } = useTrialStatus()

  // Recupera o estado da sidebar no carregamento do componente
  useEffect(() => {
    // Somente aplicar o estado salvo da sidebar se não for um dispositivo móvel
    const checkIfMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      
      // Se não for mobile, podemos usar o estado salvo
      if (!mobile) {
        const savedState = localStorage.getItem('sidebar_state')
        if (savedState) {
          setIsCollapsed(savedState === 'collapsed')
        }
      } else {
        // Em dispositivos móveis, a sidebar nunca deve ficar colapsada
        setIsCollapsed(false)
      }
    }
    
    // Verifica inicialmente
    checkIfMobile()
    
    // Adiciona listener para redimensionamento
    window.addEventListener('resize', checkIfMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Função para alternar o estado da sidebar
  const toggleSidebar = () => {
    // Só permitir colapsar a sidebar em desktop
    if (!isMobile) {
      const newState = !isCollapsed
      setIsCollapsed(newState)
      localStorage.setItem('sidebar_state', newState ? 'collapsed' : 'expanded')
    }
  }

  return (
    <PageTitleProvider>
      <div className="h-full relative bg-white overflow-hidden">
        {/* Sidebar container - apenas para desktop */}
        <div 
          className="hidden h-full md:flex md:fixed md:inset-y-0 z-[80] transition-all duration-300 ease-in-out"
          style={{ width: isCollapsed ? '70px' : '18rem' }}
        >
          <Sidebar isCollapsed={isCollapsed} onCollapseChange={setIsCollapsed} showToggle={false} />
        </div>
        
        {/* Toggle button for desktop */}
        <Button 
          variant="default" 
          size="icon" 
          onClick={toggleSidebar}
          className={cn(
            "fixed z-[90] top-6 hidden md:flex items-center justify-center rounded-full w-7 h-7 transition-all duration-300 ease-in-out",
            isCollapsed 
              ? "left-[calc(70px-0.875rem)]" 
              : "left-[calc(18rem-0.875rem)]",
          )}
        >
          {isCollapsed ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-4 w-4"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-4 w-4"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          )}
        </Button>
        
        {/* Header mobile - aplicado apenas em telas pequenas */}
        <MobileHeader />

        {/* Main content */}
        <main 
          className="h-full transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden md:pt-0"
          style={{ 
            marginLeft: isMobile ? '0' : (isCollapsed ? '70px' : '18rem'),
            width: isMobile ? '100%' : `calc(100% - ${isCollapsed ? '70px' : '18rem'})`,
            maxWidth: '100vw',
            paddingTop: isMobile ? '40px' : '0' // 40px é a altura do header mobile (h-10)
          }}
        >
          {/* Header global para desktop */}
          <div className="hidden md:block">
            <GlobalHeader isSidebarCollapsed={isCollapsed} />
          </div>
          
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
