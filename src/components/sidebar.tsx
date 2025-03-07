'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, BookOpen, GraduationCap, ClipboardCheck, RotateCcw, LineChart, MessageCircle, CreditCard, PanelLeft, Info, BarChart3, Calendar, Target, Layers } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useProfile } from '@/hooks/useProfile'
import { ProfileDropdown } from "./profile-dropdown"
import { useState, useEffect } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ComingSoonDialog } from './coming-soon-dialog'

const routes = [
  {
    id: "dashboard",
    label: 'Progresso',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    id: "subjects",
    label: 'Matérias',
    href: '/dashboard/subjects',
    icon: GraduationCap
  },
  {
    id: "study",
    label: 'Estudo',
    href: '/dashboard/study',
    icon: BookOpen
  },
  {
    id: "assessments",
    label: 'Avaliações',
    href: '/dashboard/assessments',
    icon: ClipboardCheck
  },
  {
    id: "review",
    label: 'Revisão',
    href: '/dashboard/review',
    icon: RotateCcw
  },
  {
    id: "grades",
    label: 'Notas',
    href: '/dashboard/grades',
    icon: LineChart
  },
  {
    id: "advanced-analysis",
    label: 'Análise avançada',
    href: '#',
    icon: BarChart3,
    comingSoon: true,
    ai: true
  },
  {
    id: "smart-planning",
    label: 'Planejamento Inteligente',
    href: '#',
    icon: Calendar,
    comingSoon: true,
    ai: true
  },
  {
    id: "blind-spots",
    label: 'Meus pontos cegos',
    href: '#',
    icon: Target,
    comingSoon: true,
    ai: true
  },
  {
    id: "flashcards",
    label: 'Flashcards',
    href: '#',
    icon: Layers,
    comingSoon: true
  }
]

function getInitials(name: string): string {
  if (!name) return ''
  
  return name
    .split(' ')
    .map(word => word[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface SidebarProps {
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  showToggle?: boolean;
}

export function Sidebar({ isCollapsed = false, onCollapseChange, showToggle = true }: SidebarProps) {
  const pathname = usePathname()
  const { profile } = useProfile()
  const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  const [dropdownSide, setDropdownSide] = useState<'right' | 'top'>(isSmallScreen ? 'top' : 'right')
  const [innerCollapsed, setInnerCollapsed] = useState(isCollapsed)
  const [comingSoonOpen, setComingSoonOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState("")

  useEffect(() => {
    const handleResize = () => {
      setDropdownSide(window.innerWidth <= 768 ? 'top' : 'right')
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Sincroniza o estado interno com a prop passada do componente pai
  useEffect(() => {
    setInnerCollapsed(isCollapsed)
  }, [isCollapsed])

  // Função para alternar o estado da sidebar
  const toggleSidebar = () => {
    const newState = !innerCollapsed
    setInnerCollapsed(newState)
    
    // Comunica a mudança ao componente pai se a função de callback foi fornecida
    if (onCollapseChange) {
      onCollapseChange(newState)
    }
  }

  // Função para abrir o diálogo de "em breve"
  const handleComingSoonClick = (featureName: string) => {
    setSelectedFeature(featureName)
    setComingSoonOpen(true)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex h-full flex-col bg-studiefy-black text-studiefy-white transition-all duration-300 ease-in-out",
          innerCollapsed ? "w-[70px]" : "w-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo fixo no topo */}
          <div className="flex items-center p-4">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center text-2xl font-bold transition-all duration-300 ease-in-out",
                innerCollapsed ? "justify-center pl-0 w-full" : "pl-3"
              )}
            >
              {innerCollapsed ? "S" : "Studiefy"}
            </Link>
            {showToggle && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSidebar} 
                className={cn(
                  "ml-auto text-studiefy-gray hover:text-studiefy-white hover:bg-studiefy-black/20",
                  innerCollapsed && "rotate-180 mx-auto"
                )}
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Área de rolagem para os itens do menu */}
          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="px-3 py-2">
              <div className="space-y-1">
                <div className="flex flex-1 flex-col gap-1">
                  {routes.map((route) => (
                    innerCollapsed ? (
                      <Tooltip key={route.id} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <div
                            onClick={() => route.comingSoon ? handleComingSoonClick(route.label) : null}
                            className={cn(
                              "flex items-center justify-center rounded-lg p-2 text-base font-medium transition-colors hover:bg-studiefy-black/5 cursor-pointer",
                              pathname === route.href
                                ? "bg-studiefy-black/10 text-studiefy-white"
                                : "text-studiefy-gray hover:text-studiefy-white"
                            )}
                          >
                            {route.comingSoon ? (
                              <route.icon className="h-5 w-5" />
                            ) : (
                              <Link href={route.href} className="flex items-center justify-center">
                                <route.icon className="h-5 w-5" />
                              </Link>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="border-studiefy-black bg-studiefy-black/90 text-studiefy-white">
                          {route.label}
                          {route.ai && <span className="text-xs ml-1 text-studiefy-primary align-top">IA</span>}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div
                        key={route.id}
                        onClick={() => route.comingSoon ? handleComingSoonClick(route.label) : null}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-studiefy-black/5 cursor-pointer",
                          pathname === route.href
                            ? "bg-studiefy-black/10 text-studiefy-white"
                            : "text-studiefy-gray hover:text-studiefy-white"
                        )}
                      >
                        {route.comingSoon ? (
                          <>
                            <route.icon className="h-5 w-5" />
                            <span>{route.label}</span>
                            {route.ai && <span className="text-xs text-studiefy-primary align-top">IA</span>}
                          </>
                        ) : (
                          <Link href={route.href} className="flex items-center gap-3 w-full">
                            <route.icon className="h-5 w-5" />
                            <span>{route.label}</span>
                            {route.ai && <span className="text-xs text-studiefy-primary align-top">IA</span>}
                          </Link>
                        )}
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Área fixa do rodapé com links e perfil */}
          <div className="mt-auto">
            {/* Links de Feedback e Suporte e Assinatura lado a lado */}
            <div className="flex items-center justify-between px-3 py-2 mb-2 border-t border-studiefy-black/10 pt-2">
              {/* Link de Feedback e Suporte */}
              {innerCollapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href="/dashboard/feedback"
                      className="flex items-center justify-center p-2 text-studiefy-gray hover:text-studiefy-white"
                    >
                      <Info className="h-4 w-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="border-studiefy-black bg-studiefy-black/90 text-studiefy-white">
                    Feedback e Suporte
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/dashboard/feedback"
                  className="flex items-center justify-start gap-2 text-sm text-studiefy-gray hover:text-studiefy-white"
                >
                  <Info className="h-4 w-4" />
                  Feedback e Suporte
                </Link>
              )}
              
              {/* Link de Assinatura */}
              {innerCollapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href="/dashboard/subscription"
                      className="flex items-center justify-center p-2 text-studiefy-gray hover:text-studiefy-white"
                    >
                      <CreditCard className="h-4 w-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="border-studiefy-black bg-studiefy-black/90 text-studiefy-white">
                    Assinatura
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/dashboard/subscription"
                  className="flex items-center justify-start gap-2 text-sm text-studiefy-gray hover:text-studiefy-white"
                >
                  <CreditCard className="h-4 w-4" />
                  Assinatura
                </Link>
              )}
            </div>

            <ProfileDropdown
              user={{
                name: profile?.username ? `@${profile.username}` : profile?.name,
                email: profile?.email || undefined,
                avatar_url: profile?.avatar_url || undefined,
                username: profile?.username || undefined
              }}
              side={dropdownSide}
              className={cn(
                "w-full",
                innerCollapsed && "px-0.5 py-2 flex justify-center"
              )}
              isCollapsed={innerCollapsed}
            />
          </div>
        </div>
      </div>

      {/* Diálogo de "Em breve" */}
      <ComingSoonDialog 
        isOpen={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        featureName={selectedFeature}
      />
    </TooltipProvider>
  )
}
