'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, BookOpen, GraduationCap, ClipboardCheck, RotateCcw, LineChart, MessageCircle, CreditCard, PanelLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useProfile } from '@/hooks/useProfile'
import { ProfileDropdown } from "./profile-dropdown"
import { useState, useEffect } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const routes = [
  {
    label: 'Progresso',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Matérias',
    href: '/dashboard/subjects',
    icon: GraduationCap
  },
  {
    label: 'Estudo',
    href: '/dashboard/study',
    icon: BookOpen
  },
  {
    label: 'Avaliações',
    href: '/dashboard/assessments',
    icon: ClipboardCheck
  },
  {
    label: 'Revisão',
    href: '/dashboard/review',
    icon: RotateCcw
  },
  {
    label: 'Notas',
    href: '/dashboard/grades',
    icon: LineChart
  },
  {
    label: 'Feedback/Suporte',
    href: '/dashboard/support',
    icon: MessageCircle
  },
  {
    label: 'Assinatura',
    href: '/dashboard/subscription',
    icon: CreditCard
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

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        "flex h-full w-full flex-col bg-studiefy-black text-studiefy-white transition-all duration-300 ease-in-out",
        innerCollapsed ? "w-[70px]" : "w-full"
      )}>
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

        <div className="px-3 py-2">
          <div className="space-y-1">
            <div className="flex flex-1 flex-col gap-1">
              {routes.map((route) => (
                innerCollapsed ? (
                  <Tooltip key={route.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={route.href}
                        className={cn(
                          "flex items-center justify-center rounded-lg p-2 text-base font-medium transition-colors hover:bg-studiefy-black/5",
                          pathname === route.href
                            ? "bg-studiefy-black/10 text-studiefy-white"
                            : "text-studiefy-gray hover:text-studiefy-white"
                        )}
                      >
                        <route.icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="border-studiefy-black bg-studiefy-black/90 text-studiefy-white">
                      {route.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-studiefy-black/5",
                      pathname === route.href
                        ? "bg-studiefy-black/10 text-studiefy-white"
                        : "text-studiefy-gray hover:text-studiefy-white"
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto">
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
    </TooltipProvider>
  )
}
