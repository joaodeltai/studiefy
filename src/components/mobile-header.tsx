"use client"

import { ChevronLeft, PanelLeft, Medal, Flame } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useSubjects } from "@/hooks/useSubjects"
import { useProfile } from "@/hooks/useProfile"
import { useStreak } from "@/hooks/useStreak"
import { useEvents } from "@/hooks/useEvents"
import { Progress } from "@/components/ui/progress"
import { Button } from "./ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetTrigger 
} from "./ui/sheet"
import { Sidebar } from "./sidebar"
import { AddEventDialog } from "./add-event-dialog"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import Link from "next/link"

// Funções para cálculo de XP
const getXPForLevel = (level: number) => level * 10

// Função para obter iniciais do nome
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

export function MobileHeader() {
  // 1. Primeiro todos os hooks
  const router = useRouter()
  const pathname = usePathname()
  const { subjects } = useSubjects()
  const { profile } = useProfile()
  const { streak } = useStreak()
  const isSubjectPage = pathname.startsWith("/dashboard/subjects/") && pathname.split("/").length === 4
  const subjectId = isSubjectPage ? pathname.split("/")[3] : ""
  const { addEvent } = useEvents(subjectId)

  // 2. Depois as variáveis derivadas dos hooks
  const isDashboard = pathname === "/dashboard"
  const showBackButton = pathname !== "/dashboard"
  const xpForNextLevel = profile?.level ? getXPForLevel(profile.level) : 0
  const progress = profile?.xp ? (profile.xp / xpForNextLevel) * 100 : 0
  const userInitials = profile?.name ? getInitials(profile.name) : '?'

  // 3. Funções que usam os valores dos hooks
  function getSubjectColor() {
    if (pathname.startsWith("/dashboard/subjects/")) {
      const subjectId = pathname.split("/").pop()
      const subject = subjects?.find((s) => s.id === subjectId)
      return subject?.color || undefined
    }
    return undefined
  }

  function getPageTitle() {
    if (pathname === "/dashboard") {
      return "Progresso"
    }

    if (pathname === "/dashboard/subjects") {
      return "Matérias"
    }

    if (pathname.startsWith("/dashboard/subjects/")) {
      const subjectId = pathname.split("/").pop()
      const subject = subjects?.find((s) => s.id === subjectId)
      return subject?.name || "Matéria"
    }

    if (pathname === "/dashboard/profile") {
      return "Minha Conta"
    }

    if (pathname === "/dashboard/assessments") {
      return "Avaliações"
    }

    if (pathname === "/dashboard/review") {
      return "Revisão"
    }

    if (pathname === "/dashboard/study") {
      return "Estudos"
    }

    return "Studiefy"
  }

  // 4. Verificação se está em página pública
  if (!pathname.startsWith('/dashboard')) {
    return null;
  }

  const subjectColor = getSubjectColor()

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex flex-col border-b border-studiefy-black/10 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 h-10">
        {/* Botão da sidebar no lado esquerdo */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="p-1.5">
              <PanelLeft className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu de Navegação</SheetTitle>
            </SheetHeader>
            <Sidebar isCollapsed={false} onCollapseChange={() => {}} showToggle={false} />
          </SheetContent>
        </Sheet>

        {/* Título da página no centro */}
        <div className="flex items-center">
          {subjectColor && (
            <div 
              className="w-2 h-5 rounded-full mr-2" 
              style={{ backgroundColor: subjectColor }}
            />
          )}
          <span className="font-semibold text-sm">{getPageTitle()}</span>
        </div>

        {/* Avatar do usuário no lado direito */}
        <Link href="/dashboard/profile" className="flex items-center">
          <Avatar className="h-7 w-7 shadow-sm">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.name || 'Avatar'} />
            ) : (
              <AvatarFallback className="bg-studiefy-black/20 text-studiefy-white text-xs">
                {userInitials}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>
      </div>
    </header>
  )
}
