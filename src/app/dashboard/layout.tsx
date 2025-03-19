'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { TrialBanner } from "@/components/ui/trial-banner"
import { useTrialStatus } from "@/hooks/useTrialStatus"
import { OnboardingSystem } from "@/components/onboarding/onboarding-system"

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
        variant="ghost" 
        size="sm" 
        onClick={toggleSidebar}
        className={cn(
          "fixed z-[90] top-4 hidden md:flex items-center justify-center text-studiefy-gray hover:text-studiefy-black hover:bg-studiefy-black/10 transition-all duration-300 ease-in-out",
          isCollapsed 
            ? "left-[calc(70px+0.5rem)]" 
            : "left-[calc(18rem+0.5rem)]",
          isCollapsed && "rotate-180"
        )}
      >
        <PanelLeft className="h-5 w-5" />
      </Button>
      
      {/* Main content */}
      <main 
        className="h-full transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden"
        style={{ 
          marginLeft: isMobile ? '0' : (isCollapsed ? '70px' : '18rem'),
          width: isMobile ? '100%' : `calc(100% - ${isCollapsed ? '70px' : '18rem'})`,
          maxWidth: '100vw'
        }}
      >
        <MobileHeader />
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
  )
}
