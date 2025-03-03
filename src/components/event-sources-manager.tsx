"use client"

import { useState } from "react"
import { useEventSources, EventSource } from "@/hooks/useEventSources"
import { AddEventSourceDialog } from "@/components/add-event-source-dialog"
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

export function EventSourcesManager() {
  const { sources, loading, addSource, deleteSource, updateSource } = useEventSources()
  const [isAddSourceDialogOpen, setIsAddSourceDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<EventSource | null>(null)
  const [editValue, setEditValue] = useState("")
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null)
  
  const handleStartEdit = (source: EventSource) => {
    setEditingSource(source)
    setEditValue(source.name)
  }
  
  const handleCancelEdit = () => {
    setEditingSource(null)
    setEditValue("")
  }
  
  const handleSaveEdit = async () => {
    if (!editingSource) return
    
    try {
      await updateSource(editingSource.id, editValue)
      toast.success("Origem atualizada com sucesso!")
      setEditingSource(null)
      setEditValue("")
    } catch (error) {
      toast.error("Erro ao atualizar origem.")
    }
  }
  
  const handleConfirmDelete = async () => {
    if (!deletingSourceId) return
    
    try {
      await deleteSource(deletingSourceId)
      toast.success("Origem removida com sucesso!")
      setDeletingSourceId(null)
    } catch (error) {
      toast.error("Erro ao remover origem.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Origens de Eventos</h3>
        <Button 
          size="sm" 
          className="gap-1"
          onClick={() => setIsAddSourceDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-studiefy-black/70 mr-2" />
          <span className="text-sm text-studiefy-gray">Carregando origens...</span>
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center py-4 text-studiefy-gray">
          <p>Nenhuma origem cadastrada.</p>
          <p className="text-sm">Adicione origens para identificar a procedência dos seus eventos de estudo.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {sources.map((source) => (
            <li 
              key={source.id} 
              className="flex items-center justify-between p-3 bg-white rounded-md border"
            >
              {editingSource?.id === source.id ? (
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
                  <span className="font-medium">{source.name}</span>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleStartEdit(source)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setDeletingSourceId(source.id)}
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
      
      <AddEventSourceDialog 
        onAddSource={addSource} 
        isOpenExternal={isAddSourceDialogOpen}
        onOpenChangeExternal={setIsAddSourceDialogOpen}
        showTriggerButton={false}
      />
      
      <AlertDialog open={!!deletingSourceId} onOpenChange={(open) => !open && setDeletingSourceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover origem</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta origem? Esta ação não pode ser desfeita.
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
