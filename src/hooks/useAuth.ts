"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          throw new Error('Email ou senha incorretos')
        }
        if (signInError.message === 'Email not confirmed') {
          throw new Error('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.')
        }
        throw signInError
      }

      router.refresh()
      router.push('/dashboard')
    } catch (error) {
      console.error('Erro de login:', error)
      setError(error instanceof Error ? error.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (signUpError) throw signUpError

      // Redirecionar para a página de verificação de email após registro bem-sucedido
      router.push('/auth/verify-email')
      
      return data
    } catch (error) {
      console.error('Erro de cadastro:', error)
      setError(error instanceof Error ? error.message : 'Erro ao criar conta')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      router.refresh()
      router.push('/auth/login')
    } catch (error) {
      console.error('Erro ao sair:', error)
      setError(error instanceof Error ? error.message : 'Erro ao sair')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
  }
}
