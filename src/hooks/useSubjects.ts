"use client"

import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"

export interface Subject {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchSubjects()
    }
  }, [user])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setSubjects(data || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    } finally {
      setLoading(false)
    }
  }

  const addSubject = async (name: string, color: string) => {
    try {
      const newSubject = {
        name,
        color,
        user_id: user?.id,
      }

      const { data, error } = await supabase
        .from("subjects")
        .insert([newSubject])
        .select()
        .single()

      if (error) {
        throw error
      }

      setSubjects((prev) => [data, ...prev])
      return data
    } catch (error) {
      console.error("Error adding subject:", error)
      throw error
    }
  }

  const deleteSubject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id)

      if (error) {
        throw error
      }

      setSubjects((prev) => prev.filter((subject) => subject.id !== id))
    } catch (error) {
      console.error("Error deleting subject:", error)
      throw error
    }
  }

  const updateSubject = async (id: string, name: string, color: string) => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .update({ name, color })
        .eq("id", id)
        .eq("user_id", user?.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setSubjects((prev) =>
        prev.map((subject) => 
          subject.id === id ? { ...subject, name, color } : subject
        )
      )
      return data
    } catch (error) {
      console.error("Error updating subject:", error)
      throw error
    }
  }

  return {
    subjects,
    loading,
    addSubject,
    deleteSubject,
    updateSubject,
    refreshSubjects: fetchSubjects,
  }
}
