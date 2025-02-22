"use client"

import { useProfile } from "@/hooks/useProfile"
import { useStreak } from "@/hooks/useStreak"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, ChevronLeft, Flame } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import cn from "classnames"

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

export default function ProfilePage() {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile()
  const { streak, loading: loadingStreak } = useStreak()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  if (loading || loadingStreak) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-studiefy-black/70" />
      </div>
    )
  }

  if (!profile || !streak) {
    return null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      await uploadAvatar(file)
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setUploading(false)
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
    <div className="h-full">
      <header className="hidden md:flex items-center gap-3 px-8 h-14 border-b border-studiefy-black/10">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-studiefy-black/5"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-xl">Minha Conta</h1>
      </header>

      <div className="h-[calc(100%-3.5rem)] p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
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
                  <h2 className="text-2xl font-semibold text-studiefy-black">
                    {profile.name}
                  </h2>
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
        </div>
      </div>
    </div>
  )
}
