"use client"

import { useProfile } from "@/hooks/useProfile"
import { useStreak } from "@/hooks/useStreak"
import { useAuth } from "@/hooks/useAuth"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, ChevronLeft, Flame, User, Settings, CreditCard, Plus, LogOut, Trash } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import cn from "classnames"
import { useSubjects } from "@/hooks/useSubjects"
import { useEventSources } from "@/hooks/useEventSources"
import { useSubjectCategories } from "@/hooks/useSubjectCategories"
import { AddCategoryDialog } from "@/components/add-category-dialog"
import { SubjectCategoriesManager } from "@/components/subject-categories-manager"
import { AddEventSourceDialog } from "@/components/add-event-source-dialog"
import { EventSourcesManager } from "@/components/event-sources-manager"
import { AddSubjectDialog } from "@/components/add-subject-dialog"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { SubscriptionContent as SubscriptionComponent } from "@/components/subscription-content"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/hooks/useSubscription"
import { useTrialStatus } from "@/hooks/useTrialStatus"
import { useSetPageTitle } from "@/hooks/useSetPageTitle"
import { TrashContent } from "@/components/trash-content"

const formatMemberSince = (date: string) => {
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]
  const d = new Date(date)
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`
}

// Funções para cálculo de XP (duplicadas do hook useXP para manter consistência)
const getXPForLevel = (level: number) => level * 10
const getTotalXPForLevel = (level: number) => {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i)
  }
  return total
}

// Componente para o conteúdo do perfil
function ProfileContent({ profile, streak, fileInputRef, uploading, uploadAvatar, updateProfile }: {
  profile: any;
  streak: any;
  fileInputRef: React.RefObject<HTMLInputElement>;
  uploading: boolean;
  uploadAvatar: (file: File) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}) {
  const { isPremium } = useSubscription();
  const { isTrialing } = useTrialStatus();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await uploadAvatar(file)
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  // Calcular XP necessário para o próximo nível
  const xpForNextLevel = profile.level < 50 ? getXPForLevel(profile.level) : getXPForLevel(50)
  const progress = (profile.xp / xpForNextLevel) * 100

  // Calcular XP total acumulado
  const totalXP = getTotalXPForLevel(profile.level) + profile.xp

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-studiefy-black/10">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div className="relative group">
          <div className="relative h-24 w-24 rounded-full overflow-hidden">
            <Avatar className="h-full w-full">
              <AvatarImage 
                src={profile.avatar_url || undefined} 
                alt={profile.name}
                className="object-cover w-full h-full"
              />
              <AvatarFallback className="text-lg">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-studiefy-black">
                {profile.name}
              </h2>
              {isTrialing ? (
                <Badge className="bg-sky-100 border border-sky-300 text-sky-800 font-medium">
                  Trial
                </Badge>
              ) : isPremium ? (
                <Badge className="bg-foreground text-primary font-medium">
                  Premium
                </Badge>
              ) : (
                <Badge className="bg-zinc-100 border border-zinc-300 text-zinc-800 font-medium">
                  Free
                </Badge>
              )}
            </div>
            <div 
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full",
                streak.streak > 0 
                  ? "bg-orange-100 text-orange-600" 
                  : "bg-zinc-100 text-zinc-600"
              )}
            >
              <Flame className="h-4 w-4" />
              <span className="text-sm font-medium">
                {streak.streak} {streak.streak === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-studiefy-black/60">
              {profile.email}
            </p>
            {profile.username && (
              <p className="text-studiefy-black/60 font-mono">
                @{profile.username}
              </p>
            )}
          </div>
          <div className="mt-4 flex justify-center sm:justify-start">
            <EditProfileDialog
              profile={profile}
              onSave={updateProfile}
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">Nível {profile.level}</span>
              <span className="text-sm text-studiefy-black/60">
                {profile.xp} / {xpForNextLevel} XP
              </span>
            </div>
            <span className="text-xs text-studiefy-black/40">
              XP Total: {totalXP}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-studiefy-black/60">
              {Math.round(progress)}%
            </span>
            {profile.level < 50 && (
              <span className="text-xs text-studiefy-black/40">
                Próximo nível: {profile.level + 1} ({xpForNextLevel} XP)
              </span>
            )}
            {profile.level >= 50 && (
              <span className="text-xs text-green-500 font-medium">
                Nível Máximo!
              </span>
            )}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-[11px] text-studiefy-black/40 mt-2 text-center">
          Membro desde {formatMemberSince(profile.created_at)}
        </p>
      </div>
    </div>
  )
}

// Componente para o conteúdo de configurações
function SettingsContent() {
  const { subjects, loading, addSubject } = useSubjects()
  const { addSource } = useEventSources()
  const [isAddSubjectDialogOpen, setIsAddSubjectDialogOpen] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const { addCategory } = useSubjectCategories(selectedSubjectId || "")
  
  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-studiefy-black/10">
      <h2 className="text-xl font-semibold mb-6">Configurações</h2>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-studiefy-black">Gerenciar Matérias</h3>
          
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="subject-select">Matérias cadastradas</Label>
              {loading ? (
                <div className="flex items-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-studiefy-black/70 mr-2" />
                  <span className="text-sm text-studiefy-gray">Carregando matérias...</span>
                </div>
              ) : (
                <Select onValueChange={(value) => setSelectedSubjectId(value)}>
                  <SelectTrigger id="subject-select" className="w-full">
                    <SelectValue placeholder="Selecione uma matéria" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        Nenhuma matéria cadastrada
                      </SelectItem>
                    ) : (
                      subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: subject.color }}
                            />
                            <span>{subject.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <Button 
              size="icon" 
              className="h-10 w-10"
              onClick={() => setIsAddSubjectDialogOpen(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          <p className="text-sm text-studiefy-gray">
            Adicione, remova ou edite suas matérias. As matérias cadastradas aparecerão na aba de Matérias.
          </p>
        </div>
        
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-studiefy-black">Categorias da Matéria</h3>
            <AddCategoryDialog 
              onAddCategory={addCategory} 
              subjectId={selectedSubjectId}
              showTriggerButton={true}
            />
          </div>
          <p className="text-sm text-studiefy-gray mb-4">
            Adicione categorias para organizar os conteúdos de estudo dentro de cada matéria. 
            Por exemplo, para Matemática, você pode criar categorias como "Álgebra", "Geometria Plana", etc.
          </p>
          
          <SubjectCategoriesManager subjectId={selectedSubjectId} hideTitle={true} />
        </div>
        
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-studiefy-black">Origens de Eventos</h3>
            <AddEventSourceDialog onAddSource={addSource} />
          </div>
          <p className="text-sm text-studiefy-gray mb-4">
            Adicione origens para identificar a procedência dos seus eventos de estudo.
            Por exemplo: "ENEM 2022", "UFRGS 2020", "Simulado Cursinho", etc.
          </p>
          
          <EventSourcesManager hideTitle={true} />
        </div>
      </div>
      
      <AddSubjectDialog 
        onAddSubject={addSubject} 
        isOpenExternal={isAddSubjectDialogOpen}
        onOpenChangeExternal={setIsAddSubjectDialogOpen}
        showTriggerButton={false}
      />
    </div>
  )
}

// Componente para o conteúdo de assinatura
function SubscriptionContentWrapper() {
  return <SubscriptionComponent />
}

export default function ProfilePage() {
  const { profile, loading: profileLoading, updateProfile: updateProfileHook, uploadAvatar } = useProfile()
  const { streak, loading: streakLoading } = useStreak()
  const { signOut } = useAuth()
  const { isPremium, isLoading: subscriptionLoading } = useSubscription()
  const { isTrialing, isLoading: trialLoading } = useTrialStatus()
  const [activeTab, setActiveTab] = useState('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  useSetPageTitle('Minha Conta')
  
  if (profileLoading || streakLoading || subscriptionLoading || trialLoading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  if (!profile || !streak) {
    return null
  }

  const handleUploadAvatar = async (file: File) => {
    try {
      setUploading(true)
      await uploadAvatar(file)
      toast.success('Foto de perfil atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error)
      toast.error('Erro ao atualizar foto de perfil')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="h-full">
      <div className="h-full p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Navegação lateral */}
            <div className="md:w-64 shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-studiefy-black/10 overflow-hidden">
                <nav className="flex flex-col">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'profile' ? 'bg-studiefy-black/5 font-medium' : 'hover:bg-studiefy-black/5'}`}
                  >
                    <User className="h-5 w-5" />
                    <span>Perfil</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'settings' ? 'bg-studiefy-black/5 font-medium' : 'hover:bg-studiefy-black/5'}`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Configurações</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('subscription')}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'subscription' ? 'bg-studiefy-black/5 font-medium' : 'hover:bg-studiefy-black/5'}`}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Assinatura</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('trash')}
                    className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'trash' ? 'bg-studiefy-black/5 font-medium' : 'hover:bg-studiefy-black/5'}`}
                  >
                    <Trash className="h-5 w-5" />
                    <span>Lixeira</span>
                  </button>
                </nav>
              </div>
              {/* Botão de sair */}
              <div className="mt-4 flex justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="flex items-center gap-2 px-4 py-2 text-foreground hover:text-red-500 hover:bg-red-50"
                        onClick={async () => {
                          try {
                            await signOut();
                            // O redirecionamento é tratado dentro da função signOut
                          } catch (error) {
                            console.error('Erro ao fazer logout:', error);
                            toast.error('Erro ao fazer logout');
                          }
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Sair</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Encerrar sessão</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1">
              {activeTab === 'profile' && (
                <ProfileContent 
                  profile={profile} 
                  streak={streak} 
                  fileInputRef={fileInputRef} 
                  uploading={uploading} 
                  uploadAvatar={handleUploadAvatar}
                  updateProfile={updateProfileHook}
                />
              )}
              {activeTab === 'settings' && <SettingsContent />}
              {activeTab === 'subscription' && <SubscriptionContentWrapper />}
              {activeTab === 'trash' && <TrashContent />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
