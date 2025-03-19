"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export interface Profile {
  id: string
  user_id: string
  email: string
  name: string
  username: string | null
  avatar_url: string | null
  level: number
  xp: number
  subscription_plan: string
  created_at: string
  updated_at: string
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error) {
        throw error
      }

      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Erro ao carregar perfil")
    } finally {
      setLoading(false)
    }
  }

  const isUsernameAvailable = async (username: string): Promise<{ available: boolean; message?: string }> => {
    try {
      // Verificar formato do username
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return {
          available: false,
          message: "Nome de usuário pode conter apenas letras, números e underscore"
        }
      }

      // Verificar tamanho mínimo e máximo
      if (username.length < 3) {
        return {
          available: false,
          message: "Nome de usuário deve ter no mínimo 3 caracteres"
        }
      }

      if (username.length > 20) {
        return {
          available: false,
          message: "Nome de usuário deve ter no máximo 20 caracteres"
        }
      }

      // Se o username for igual ao atual do usuário, está disponível
      if (profile?.username === username) {
        return { available: true }
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle()

      if (error) {
        console.error("Error checking username:", error)
        return {
          available: false,
          message: "Erro ao verificar disponibilidade do nome de usuário"
        }
      }

      return {
        available: data === null,
        message: data !== null ? "Este nome de usuário já está em uso" : undefined
      }
    } catch (error) {
      console.error("Error checking username availability:", error)
      return {
        available: false,
        message: "Erro ao verificar disponibilidade do nome de usuário"
      }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    try {
      // Se estiver atualizando o username, verificar disponibilidade primeiro
      if (updates.username && updates.username !== profile?.username) {
        const { available, message } = await isUsernameAvailable(updates.username)
        if (!available) {
          throw new Error(message || "Nome de usuário indisponível")
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)

      if (error) {
        console.error("Supabase update error:", error)
        throw new Error(error.message)
      }

      // Atualizar o estado local apenas se a atualização for bem-sucedida
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      toast.success("Perfil atualizado com sucesso")
    } catch (error) {
      console.error("Error updating profile:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Erro ao atualizar perfil")
      }
      throw error
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!user) return

    try {
      // Validar o tipo do arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas imagens são permitidas')
      }

      // Limitar o tamanho do arquivo (2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 2MB')
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      // Permitir apenas extensões de imagem comuns
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) {
        throw new Error('Formato de imagem não suportado')
      }

      const fileName = `${user.id}.${fileExt}`
      const filePath = `${fileName}`

      // Remover avatar antigo se existir
      try {
        await supabase.storage
          .from('avatars')
          .remove([filePath])
      } catch (error) {
        console.log('Erro ao remover avatar antigo:', error)
      }

      // Fazer upload do novo avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '0',
          contentType: file.type
        })

      if (uploadError) {
        throw uploadError
      }

      // Gerar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Forçar refresh adicionando timestamp
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`

      // Atualizar o perfil com a nova URL
      await updateProfile({ avatar_url: urlWithTimestamp })

      toast.success('Foto de perfil atualizada com sucesso')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Erro ao fazer upload da foto de perfil')
      }
      throw error
    }
  }

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    isUsernameAvailable,
  }
}
