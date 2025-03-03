"use client"

import { useRouter } from "next/navigation"
import { useSubjectStats } from "../hooks/useSubjectStats"
import { Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Progress } from "./ui/progress"
import { Card, CardContent } from "./ui/card"
import { cn } from "@/lib/utils"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu"
import { useState } from "react"
import { useSubjects } from "@/hooks/useSubjects"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { EditSubjectDialog } from "./edit-subject-dialog"

interface SubjectCardProps {
  id: string
  name: string
  color: string
}

export function SubjectCard({ id, name, color }: SubjectCardProps) {
  const router = useRouter()
  const { stats, loading } = useSubjectStats(id)
  const { deleteSubject } = useSubjects()
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  const handleCardClick = () => {
    router.push(`/dashboard/subjects/${id}`)
  }
  
  const handleDelete = async () => {
    try {
      await deleteSubject(id)
    } catch (error) {
      console.error("Error deleting subject:", error)
    }
  }
  
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-md",
        "cursor-pointer border border-studiefy-black/10 rounded-lg"
      )}
    >
      {/* Color bar */}
      <div 
        className="absolute left-0 top-0 w-1 h-full transition-all group-hover:w-1.5" 
        style={{ backgroundColor: color }}
      />
      
      <CardContent className="p-3 sm:p-6 relative">
        {/* Options Menu */}
        <div className="absolute right-2 top-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                onClick={(e) => e.stopPropagation()} 
                className="h-8 w-8 rounded-full flex items-center justify-center text-studiefy-black/70 hover:bg-studiefy-black/10"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setIsEditDialogOpen(true);
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteAlertOpen(true);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Card content - clickable area */}
        <div onClick={handleCardClick}>
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
        </div>
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir matéria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a matéria "{name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Subject Dialog */}
      <EditSubjectDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        subject={{ id, name, color }}
      />
    </Card>
  )
}
