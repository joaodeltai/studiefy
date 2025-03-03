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

// Funções para cálculo de XP
const getXPForLevel = (level: number) => level * 10

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

    return "Studiefy"
  }

  // 4. Por fim, verificação de renderização
  if (pathname.includes("/contents/") || 
      pathname.includes("/study") || 
      pathname.includes("/assessments") ||
      pathname.includes("/events/")) {
    return null
  }

  const subjectColor = getSubjectColor()

  return (
    <header className="md:hidden flex flex-col border-b border-studiefy-black/10">
      <div className="flex items-center gap-3 px-4 h-14">
        {showBackButton ? (
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-studiefy-black/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2">
                <PanelLeft className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu de Navegação</SheetTitle>
              </SheetHeader>
              <Sidebar />
            </SheetContent>
          </Sheet>
        )}

        {isDashboard ? (
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-semibold">
                  {profile?.level || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                <span className="text-sm font-semibold">
                  {streak?.streak}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-1 mt-2" />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {subjectColor && (
                <div 
                  className="w-3 h-6 rounded-full" 
                  style={{ backgroundColor: subjectColor }}
                />
              )}
              <span className="font-semibold">{getPageTitle()}</span>
            </div>
            {isSubjectPage && (
              <AddEventDialog onAddEvent={addEvent} />
            )}
          </div>
        )}
      </div>
    </header>
  )
}
