'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Recupera o estado da sidebar no carregamento do componente
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar_state')
    if (savedState) {
      setIsCollapsed(savedState === 'collapsed')
    }
  }, [])

  // Função para alternar o estado da sidebar
  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar_state', newState ? 'collapsed' : 'expanded')
  }

  return (
    <div className="h-full relative bg-white">
      {/* Sidebar container */}
      <div 
        className="hidden h-full md:flex md:fixed md:inset-y-0 z-[80] transition-all duration-300 ease-in-out overflow-hidden"
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
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: isCollapsed ? '70px' : '18rem' }}
      >
        <MobileHeader />
        {children}
      </main>
    </div>
  )
}
