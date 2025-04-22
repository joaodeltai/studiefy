'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, BookOpen, GraduationCap, ClipboardCheck, RotateCcw, LineChart, BarChart3, Calendar, Target, Layers } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useState } from 'react'
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
    id: "calendar",
    label: 'Calendário',
    href: '/dashboard/calendar',
    icon: Calendar
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

interface SidebarProps {}

export function Sidebar({}: SidebarProps) {
  const pathname = usePathname()
  const [comingSoonOpen, setComingSoonOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState("")

  const handleComingSoonClick = (featureName: string) => {
    setSelectedFeature(featureName)
    setComingSoonOpen(true)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col w-full">
        <div className="flex flex-col h-full">
          {/* Logo fixo no topo */}
          <div className="flex items-center justify-center py-6 w-full">
            <div className="w-10 h-10 flex items-center justify-center">
              <Link href="/dashboard" className="flex items-center justify-center">
                <Image 
                  src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//logo_sfy_transp.webp"
                  alt="Studiefy Logo"
                  width={36}
                  height={36}
                  className="w-9 h-9"
                  unoptimized
                />
              </Link>
            </div>
          </div>

          {/* Menu principal */}
          <div className="flex-1 overflow-y-auto py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative">
            <div className="space-y-5 flex flex-col items-center">
              {routes.map((route) => (
                <Tooltip key={route.id}>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => route.comingSoon ? handleComingSoonClick(route.label) : null}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                        pathname === route.href
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                  <TooltipContent side="right" className="border-gray-200 bg-white text-black shadow-md">
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
              ))}
            </div>
          </div>

          {/* Indicador de scroll com blur */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
          
          {/* Área fixa do rodapé */}
          <div className="mt-auto relative z-20">
            <div className="flex items-center justify-center px-3 py-4">
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
