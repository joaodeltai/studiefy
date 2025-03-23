"use client"

import { useTrash, TrashItem } from "@/hooks/useTrash"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, RefreshCw, AlertTriangle } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TrashContent() {
  const { trashItems, loading, restoreItem, deleteItemPermanently, emptyTrash, fetchTrashItems } = useTrash()
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'contents' | 'events'>('all')
  const [processingItems, setProcessingItems] = useState<Record<string, boolean>>({})

  // Filtrar itens com base na aba ativa
  const filteredItems = trashItems.filter(item => {
    if (activeTab === 'all') return true
    if (activeTab === 'contents') return item.type === 'content'
    if (activeTab === 'events') return item.type === 'event'
    return true
  })

  const handleRestoreItem = async (item: TrashItem) => {
    const itemKey = `${item.type}-${item.id}`
    setProcessingItems(prev => ({ ...prev, [itemKey]: true }))
    
    try {
      await restoreItem(item.id, item.type)
    } finally {
      setProcessingItems(prev => ({ ...prev, [itemKey]: false }))
    }
  }

  const handleDeleteItem = async (item: TrashItem) => {
    const itemKey = `${item.type}-${item.id}`
    setProcessingItems(prev => ({ ...prev, [itemKey]: true }))
    
    try {
      await deleteItemPermanently(item.id, item.type)
    } finally {
      setProcessingItems(prev => ({ ...prev, [itemKey]: false }))
    }
  }

  const handleEmptyTrash = async () => {
    setIsEmptyingTrash(true)
    try {
      await emptyTrash()
    } finally {
      setIsEmptyingTrash(false)
    }
  }

  const handleRefresh = async () => {
    await fetchTrashItems()
    toast.success("Lista de itens atualizada!")
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-studiefy-black/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-studiefy-black mb-2">Lixeira</h2>
          <p className="text-sm text-studiefy-black/70">
            Itens excluídos são mantidos por 15 dias antes de serem removidos permanentemente.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center gap-1"
                disabled={trashItems.length === 0 || isEmptyingTrash}
              >
                {isEmptyingTrash ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Esvaziar Lixeira
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Esvaziar Lixeira</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir permanentemente todos os itens da lixeira? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleEmptyTrash}>
                  Esvaziar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            Todos ({trashItems.length})
          </TabsTrigger>
          <TabsTrigger value="contents">
            Conteúdos ({trashItems.filter(item => item.type === 'content').length})
          </TabsTrigger>
          <TabsTrigger value="events">
            Eventos ({trashItems.filter(item => item.type === 'event').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {renderItems(filteredItems)}
        </TabsContent>
        
        <TabsContent value="contents" className="mt-0">
          {renderItems(filteredItems)}
        </TabsContent>
        
        <TabsContent value="events" className="mt-0">
          {renderItems(filteredItems)}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderItems(items: TrashItem[]) {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-studiefy-black/50">
          <Trash2 className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Lixeira vazia</p>
          <p className="text-sm">Não há itens na lixeira no momento.</p>
        </div>
      )
    }

    return (
      <div className="grid gap-4">
        {items.map((item) => {
          const itemKey = `${item.type}-${item.id}`
          const isProcessing = processingItems[itemKey] || false
          const expirationDate = new Date(item.expiration_date)
          const daysLeft = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          const isExpiringSoon = daysLeft <= 3

          return (
            <Card key={itemKey} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium">{item.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {item.subject_name && (
                        <span className="text-studiefy-black/70 mr-2">
                          Matéria: {item.subject_name}
                        </span>
                      )}
                      <Badge variant={item.type === 'content' ? "secondary" : "outline"} className="text-[10px] py-0 h-4">
                        {item.type === 'content' ? 'Conteúdo' : 'Evento'}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2 pt-0">
                <div className="text-xs text-studiefy-black/70">
                  <p>Excluído em: {format(new Date(item.deleted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                  {item.due_date && (
                    <p>Data: {format(new Date(item.due_date), "dd/MM/yyyy", { locale: ptBR })}</p>
                  )}
                  <div className="flex items-center mt-1">
                    {isExpiringSoon ? (
                      <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                    ) : null}
                    <p className={isExpiringSoon ? "text-amber-500 font-medium" : ""}>
                      Será excluído permanentemente em {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 text-xs" disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Excluir permanentemente
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir permanentemente</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir permanentemente este item? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteItem(item)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-8 text-xs" 
                  disabled={isProcessing}
                  onClick={() => handleRestoreItem(item)}
                >
                  {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Restaurar
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    )
  }
}
