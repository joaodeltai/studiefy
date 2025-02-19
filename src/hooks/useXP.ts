"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"

export interface Profile {
  id: string
  level: number
  xp: number
}

const MAX_LEVEL = 50
const MIN_LEVEL = 1

// Calcula o XP necessário para um determinado nível
const getXPForLevel = (level: number) => level * 10

// Calcula o XP total necessário para chegar a um determinado nível
const getTotalXPForLevel = (level: number) => {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i)
  }
  return total
}

// Calcula o nível baseado no XP total
const getLevelFromTotalXP = (totalXP: number) => {
  let level = 1
  let xpNeeded = 0

  while (level < MAX_LEVEL) {
    xpNeeded = getXPForLevel(level)
    if (totalXP < xpNeeded) break
    totalXP -= xpNeeded
    level++
  }

  return { level, remainingXP: totalXP }
}

export function useXP() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, level, xp")
        .eq("user_id", user?.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const addXP = async (amount: number) => {
    if (!profile) return

    try {
      // Calcula o XP total atual
      const currentTotalXP = getTotalXPForLevel(profile.level) + profile.xp
      const newTotalXP = currentTotalXP + amount
      
      // Calcula o novo nível e XP restante
      const { level: newLevel, remainingXP: newXP } = getLevelFromTotalXP(newTotalXP)

      // Se atingiu o nível máximo, mantém o XP no máximo possível
      const finalLevel = Math.min(newLevel, MAX_LEVEL)
      const finalXP = finalLevel === MAX_LEVEL ? getXPForLevel(MAX_LEVEL) - 1 : newXP

      const { error } = await supabase
        .from("profiles")
        .update({
          xp: finalXP,
          level: finalLevel,
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, xp: finalXP, level: finalLevel } : null)
      return { level: finalLevel, xp: finalXP }
    } catch (error) {
      console.error("Error updating XP:", error)
      throw error
    }
  }

  const removeXP = async (amount: number) => {
    if (!profile) return

    try {
      // Calcula o XP total atual
      const currentTotalXP = getTotalXPForLevel(profile.level) + profile.xp
      const newTotalXP = Math.max(0, currentTotalXP - amount)
      
      // Calcula o novo nível e XP restante
      const { level: newLevel, remainingXP: newXP } = getLevelFromTotalXP(newTotalXP)

      // Garante que não fique abaixo do nível mínimo
      const finalLevel = Math.max(newLevel, MIN_LEVEL)
      const finalXP = newXP

      const { error } = await supabase
        .from("profiles")
        .update({
          xp: finalXP,
          level: finalLevel,
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, xp: finalXP, level: finalLevel } : null)
      return { level: finalLevel, xp: finalXP }
    } catch (error) {
      console.error("Error removing XP:", error)
      throw error
    }
  }

  return {
    profile,
    loading,
    addXP,
    removeXP
  }
}
