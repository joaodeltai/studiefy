"use client"

import { useRouter } from "next/navigation"
import { useSubjectStats } from "../hooks/useSubjectStats"
import { Loader2 } from "lucide-react"
import { Progress } from "./ui/progress"
import { Card, CardContent } from "./ui/card"
import { cn } from "@/lib/utils"

interface SubjectCardProps {
  id: string
  name: string
  color: string
}

export function SubjectCard({ id, name, color }: SubjectCardProps) {
  const router = useRouter()
  const { stats, loading } = useSubjectStats(id)

  return (
    <Card 
      onClick={() => router.push(`/dashboard/subjects/${id}`)}
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-md",
        "cursor-pointer border border-studiefy-black/10"
      )}
    >
      {/* Color bar */}
      <div 
        className="absolute left-0 top-0 w-1 h-full transition-all group-hover:w-1.5" 
        style={{ backgroundColor: color }}
      />
      
      <CardContent className="p-3 sm:p-6">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 pl-2 sm:pl-3 text-studiefy-black/90 group-hover:text-studiefy-black line-clamp-1">
          {name}
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-[50px] sm:h-[60px]">
            <Loader2 className="h-5 w-5 animate-spin text-studiefy-black/50" />
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 pl-2 sm:pl-3">
            {/* Stats */}
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-sm text-studiefy-black/70">
                <span>Conteúdos</span>
                <span className="font-medium">{stats.totalContents}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm text-studiefy-black/70">
                <span>Concluídos</span>
                <span className="font-medium">{stats.completedContents}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="pt-1 sm:pt-2">
              <Progress 
                value={stats.progress} 
                className={cn(
                  "h-1 sm:h-1.5",
                  "[&>div]:bg-current [&>div]:transition-all"
                )}
                style={{ 
                  backgroundColor: `${color}20`,
                  color: color 
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
