'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, BookOpen, GraduationCap, ClipboardCheck, RotateCcw, LineChart, PanelLeft, BarChart3, Calendar, Target, Layers } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ComingSoonDialog } from './coming-soon-dialog'
import Image from 'next/image'

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
    id: "flashcards",
    label: 'Flashcards',
    href: '/dashboard/flashcards',
    icon: Layers
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
  }
]

interface SidebarProps {
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  showToggle?: boolean;
}

export function Sidebar({ isCollapsed = false, onCollapseChange, showToggle = true }: SidebarProps) {
  const pathname = usePathname()
  const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  const [innerCollapsed, setInnerCollapsed] = useState(isCollapsed)
  const [comingSoonOpen, setComingSoonOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState("")

  useEffect(() => {
    // Sincroniza o estado interno com a prop passada do componente pai
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
              <Image 
                src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//logo_branca.webp"
                alt="Studiefy Logo"
                width={32}
                height={32}
                className="w-8 h-8"
                unoptimized
              />
              {!innerCollapsed && <span className="ml-2">Studiefy</span>}
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
                              <Link href={route.href} className="flex items-center justify-center relative">
                                <route.icon className="h-5 w-5" />
                                {route.id === 'flashcards' && (
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </Link>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="border-studiefy-black bg-studiefy-black/90 text-studiefy-white">
                          <div className="flex items-center gap-1">
                            {route.label}
                            {route.id === 'flashcards' && (
                              <Badge className="bg-blue-500 text-white border-none text-xs py-0 h-5">
                                Novo
                              </Badge>
                            )}
                          </div>
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
                            <div className="flex items-center gap-1">
                              <span>{route.label}</span>
                              {route.id === 'flashcards' && (
                                <Badge className="bg-blue-500 text-white border-none text-xs py-0 h-5">
                                  Novo
                                </Badge>
                              )}
                            </div>
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

          {/* Área fixa do rodapé com link de feedback */}
          <div className="mt-auto">
            {/* Link de Feedback */}
            <div className="flex items-center justify-center px-3 py-4 border-t border-studiefy-black/10">
              {/* Conteúdo do rodapé, se necessário */}
            </div>
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
