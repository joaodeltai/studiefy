'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from 'next/navigation'
import { MessageSquareHeart, Info, Plus, Medal, Flame } from 'lucide-react'
import { cn } from "@/lib/utils"
import { usePageTitle } from "@/contexts/PageTitleContext"
import { AddEventDialog } from "@/components/add-event-dialog"
import { AddSubjectDialog } from '@/components/add-subject-dialog'
import { useSubjects } from '@/hooks/useSubjects'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useAllEvents } from '@/hooks/useAllEvents'
import { useStreak } from "@/hooks/useStreak"
import Link from 'next/link'
import { NewsDialog } from '@/components/news-dialog'
import Image from 'next/image'

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

// Funções para cálculo de XP
const getXPForLevel = (level: number) => level * 10
const getTotalXPForLevel = (level: number) => {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i)
  }
  return total
}

export function GlobalHeader({ isSidebarCollapsed }: { isSidebarCollapsed?: boolean }) {
  const { profile } = useProfile()
  const { pageTitle, titleElement, titleActions } = usePageTitle()
  const pathname = usePathname()
  const { streak, loading: loadingStreak } = useStreak()
  const [showInfo, setShowInfo] = useState(false)
  const [showSubjectContentInfo, setShowSubjectContentInfo] = useState(false)
  const [showNewsDialog, setShowNewsDialog] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)
  const btnInfoRef = useRef<HTMLButtonElement>(null)
  const subjectContentInfoRef = useRef<HTMLDivElement>(null)
  const btnSubjectContentInfoRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const { addEvent } = useAllEvents()
  
  // Verificar se estamos na página principal do dashboard (progresso)
  const isDashboardMainPage = pathname === '/dashboard'
  
  // Verificar se estamos na página de matérias
  const isSubjectsPage = pathname === '/dashboard/subjects'
  
  // Verificar se estamos na página de conteúdos de uma matéria
  const isSubjectContentPage = pathname.startsWith('/dashboard/subjects/') && pathname.split('/').length === 4
  
  // Verificar se estamos na página de avaliações
  const isAssessmentsPage = pathname === '/dashboard/assessments'
  
  // Verificar se estamos na página de eventos
  const isEventPage = pathname.includes('/events/') && pathname.split('/').length === 6
  
  // Verificar se estamos na página de flashcards
  const isFlashcardsPage = pathname === '/dashboard/flashcards'
  
  // Verificar se estamos na página de um deck específico
  const isFlashcardDeckPage = pathname.includes('/dashboard/flashcards/') && 
    pathname.split('/').length === 4 && 
    !pathname.includes('/study')
  
  // Verificar se estamos na página de flashcards
  const isFlashcardsPageOrDeck = isFlashcardsPage || isFlashcardDeckPage
  
  // Extrair o ID da matéria da URL, se estivermos na página de conteúdos
  const subjectId = isSubjectContentPage ? pathname.split('/')[3] : undefined
  
  const userInitials = profile?.name ? getInitials(profile.name) : '?'
  
  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showInfo && 
          infoRef.current && 
          btnInfoRef.current && 
          !infoRef.current.contains(event.target as Node) &&
          !btnInfoRef.current.contains(event.target as Node)) {
        setShowInfo(false)
      }
      if (showSubjectContentInfo && 
          subjectContentInfoRef.current && 
          btnSubjectContentInfoRef.current && 
          !subjectContentInfoRef.current.contains(event.target as Node) &&
          !btnSubjectContentInfoRef.current.contains(event.target as Node)) {
        setShowSubjectContentInfo(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showInfo, showSubjectContentInfo])
  
  return (
    <header className="bg-white h-20 px-8">
      <div className="flex items-center justify-between h-full">
        {/* Título da página - com margem à esquerda para não sobrepor o botão da sidebar */}
        {pageTitle && !isDashboardMainPage && (
          <div className="flex items-center">
            {/* Botão de ação do título (como voltar) - exceto para a página de flashcards */}
            {titleActions && !isFlashcardsPageOrDeck && titleActions}
            
            <h1 className={cn(
              "text-xl font-semibold text-studiefy-black",
              // Remover margem esquerda para a página de flashcards
              isFlashcardsPageOrDeck ? "ml-0" : (isSidebarCollapsed ? "ml-10" : "ml-16"),
              // Remover margem se houver ações de título (como botão voltar)
              titleActions && !isFlashcardsPageOrDeck ? "ml-0" : ""
            )}>
              {titleElement || pageTitle}
            </h1>
            
            {/* Ícone de informação para a página de matérias */}
            {isSubjectsPage && (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 h-8 w-8 rounded-full hover:bg-studiefy-black/10"
                  onClick={() => setShowInfo(!showInfo)}
                  ref={btnInfoRef}
                >
                  <Info className="h-4 w-4 text-studiefy-black/70 hover:text-studiefy-black" />
                  <span className="sr-only">Informações sobre Matérias</span>
                </Button>
                
                {showInfo && (
                  <div 
                    ref={infoRef}
                    className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-lg z-50 w-64"
                  >
                    <p className="text-sm text-studiefy-black/80">
                      Aqui você encontra todas as suas matérias cadastradas. Clique em uma matéria para ver seus conteúdos e eventos.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Ícone de informação para a página de conteúdos de uma matéria */}
            {isSubjectContentPage && (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 h-8 w-8 rounded-full hover:bg-studiefy-black/10"
                  onClick={() => setShowSubjectContentInfo(!showSubjectContentInfo)}
                  ref={btnSubjectContentInfoRef}
                >
                  <Info className="h-4 w-4 text-studiefy-black/70 hover:text-studiefy-black" />
                  <span className="sr-only">Informações sobre Conteúdos</span>
                </Button>
                
                {showSubjectContentInfo && (
                  <div 
                    ref={subjectContentInfoRef}
                    className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-lg z-50 w-64"
                  >
                    <p className="text-sm text-studiefy-black/80">
                      Aqui você encontra todos os conteúdos da matéria selecionada. Você pode adicionar novos conteúdos, marcar como concluídos, definir prioridades e datas de entrega.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Exibição de nível, XP e ofensiva na página principal */}
        {isDashboardMainPage && profile && streak && (
          <div className="flex items-center ml-16">
            <div className="flex items-center gap-2">
              <Medal className="h-6 w-6 text-yellow-500" />
              <span className="text-lg font-semibold">
                Nível {profile.level}
              </span>
              <span className="text-sm text-studiefy-black/60">
                ({profile.xp}/{getXPForLevel(profile.level)} XP)
              </span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          {/* Botão de Novo Deck - apenas na página de flashcards */}
          {isFlashcardsPage && titleActions && (
            <div className="mr-1">
              {titleActions}
            </div>
          )}
          
          {/* Botões de ação na página de um deck específico */}
          {isFlashcardDeckPage && titleActions && (
            <div className="mr-1">
              {titleActions}
            </div>
          )}
          
          {/* Ofensiva - exibida apenas na página principal (ao lado do botão de feedback) */}
          {isDashboardMainPage && profile && streak && (
            <div 
              className={cn(
                "flex items-center gap-2 px-4 py-1 rounded-full",
                streak.streak > 0 
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" 
                  : "bg-zinc-100 text-zinc-600"
              )}
            >
              <Flame className={cn(
                "h-5 w-5",
                streak.streak > 0 ? "text-white" : ""
              )} />
              <span className="font-medium">
                {streak.streak} {streak.streak === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          )}
          
          {/* Botão de adicionar matéria - apenas na página de matérias */}
          {isSubjectsPage && (
            <AddSubjectDialog 
              onAddSubject={async (name, color) => {
                try {
                  // Redirecionar para a página de matérias para adicionar
                  router.push('/dashboard/subjects')
                  toast.success("Redirecionando para adicionar matéria...")
                  return true
                } catch (error) {
                  toast.error("Erro ao redirecionar")
                  return false
                }
              }}
            />
          )}
          
          {/* Botão de adicionar evento - apenas na página de conteúdos */}
          {isSubjectContentPage && (
            <AddEventDialog 
              subjectId={subjectId} 
              onAddEvent={async (title, type, date) => {
                try {
                  // Importar o hook useEvents
                  const { useEvents } = await import('@/hooks/useEvents');
                  const { data: { user } } = await supabase.auth.getUser();
                  
                  if (!user) {
                    throw new Error('Usuário não autenticado');
                  }
                  
                  // Verificar se subjectId é definido
                  if (!subjectId) {
                    throw new Error('ID da matéria não definido');
                  }
                  
                  // Usar o hook para obter a função addEvent
                  const { addEvent } = useEvents(subjectId);
                  
                  // Chamar a função addEvent
                  await addEvent(title, type, new Date(date));
                  
                  toast.success("Evento adicionado com sucesso");
                  router.refresh(); // Atualizar a página para mostrar o novo evento
                } catch (error: any) {
                  console.error('Erro ao adicionar evento:', error);
                  toast.error("Erro ao adicionar evento");
                  throw error;
                }
              }}
            />
          )}
          
          {/* Botão de adicionar evento - apenas na página de avaliações */}
          {isAssessmentsPage && (
            <AddEventDialog 
              showSubjectSelector={true}
              onAddEvent={async (title, type, date, subjectId) => {
                try {
                  await addEvent(title, type, date, subjectId);
                  toast.success("Evento adicionado com sucesso");
                  router.refresh(); // Atualizar a página para mostrar o novo evento
                } catch (error: any) {
                  if (!error.code || error.code !== 'PLAN_LIMIT_REACHED') {
                    toast.error("Erro ao adicionar evento");
                  }
                  throw error;
                }
              }}
            />
          )}
          
          {/* Botão de Novidades */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowNewsDialog(true)}
            className="flex items-center justify-center hover:bg-transparent"
          >
            <div className="relative h-8 w-8">
              <Image 
                src="https://uwemjaqphbytkkhalqge.supabase.co/storage/v1/object/public/images//star.webp" 
                alt="Novidades" 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </Button>
          
          {/* Ícone de Feedback e Suporte */}
          <Button 
            variant="ghost" 
            size="icon"
            asChild
            className="bg-primary text- hover:text-white rounded-full h-10 w-10 flex items-center justify-center"
          >
            <Link href="/dashboard/feedback">
              <MessageSquareHeart className="h-5 w-5" />
            </Link>
          </Button>
          
          {/* Avatar do usuário - link direto para Minha Conta */}
          <Button 
            variant="ghost" 
            size="icon" 
            asChild
            className="p-0 hover:bg-studiefy-black/5 rounded-full"
          >
            <Link href="/dashboard/profile">
              <Avatar className="h-12 w-12 shadow-md">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.name || 'Avatar'} />
                ) : (
                  <AvatarFallback className="bg-studiefy-black/20 text-studiefy-white text-sm">
                    {userInitials}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Diálogo de Novidades */}
      <NewsDialog open={showNewsDialog} onOpenChange={setShowNewsDialog} />
    </header>
  )
}
