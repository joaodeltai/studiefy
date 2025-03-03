"use client"

import { useState } from "react"
import { useSubjectCategories, SubjectCategory } from "@/hooks/useSubjectCategories"
import { AddCategoryDialog } from "@/components/add-category-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Pencil, Trash2, X, Check, Plus } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SubjectCategoriesManagerProps {
  subjectId: string | null
}

export function SubjectCategoriesManager({ subjectId }: SubjectCategoriesManagerProps) {
  const { categories, loading, addCategory, deleteCategory, updateCategory } = useSubjectCategories(subjectId || "")
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<SubjectCategory | null>(null)
  const [editValue, setEditValue] = useState("")
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  
  const handleStartEdit = (category: SubjectCategory) => {
    setEditingCategory(category)
    setEditValue(category.name)
  }
  
  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditValue("")
  }
  
  const handleSaveEdit = async () => {
    if (!editingCategory) return
    
    try {
      await updateCategory(editingCategory.id, editValue)
      toast.success("Categoria atualizada com sucesso!")
      setEditingCategory(null)
      setEditValue("")
    } catch (error) {
      toast.error("Erro ao atualizar categoria.")
    }
  }
  
  const handleConfirmDelete = async () => {
    if (!deletingCategoryId) return
    
    try {
      await deleteCategory(deletingCategoryId)
      toast.success("Categoria removida com sucesso!")
      setDeletingCategoryId(null)
    } catch (error) {
      toast.error("Erro ao remover categoria.")
    }
  }

  // Se não houver matéria selecionada
  if (!subjectId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Categorias da Matéria</h3>
        </div>
        <div className="text-center py-8 text-studiefy-gray border rounded-md bg-gray-50">
          <p className="font-medium">Selecione uma matéria para gerenciar suas categorias</p>
          <p className="text-sm mt-2">As categorias ajudam a organizar os conteúdos de estudo dentro de cada matéria.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Categorias da Matéria</h3>
        <Button 
          size="sm" 
          className="gap-1"
          onClick={() => setIsAddCategoryDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-studiefy-black/70 mr-2" />
          <span className="text-sm text-studiefy-gray">Carregando categorias...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-4 text-studiefy-gray">
          <p>Nenhuma categoria cadastrada para esta matéria.</p>
          <p className="text-sm">Adicione categorias para organizar melhor seus conteúdos de estudo.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {categories.map((category) => (
            <li 
              key={category.id} 
              className="flex items-center justify-between p-3 bg-white rounded-md border"
            >
              {editingCategory?.id === category.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={handleSaveEdit}
                    disabled={!editValue.trim()}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleStartEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setDeletingCategoryId(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      
      <AddCategoryDialog 
        onAddCategory={addCategory} 
        subjectId={subjectId}
        isOpenExternal={isAddCategoryDialogOpen}
        onOpenChangeExternal={setIsAddCategoryDialogOpen}
        showTriggerButton={false}
      />
      
      <AlertDialog open={!!deletingCategoryId} onOpenChange={(open) => !open && setDeletingCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta categoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
