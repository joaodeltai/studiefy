'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

type ActivityData = {
  date: string
  count: number
}

export function useFlashcardActivity() {
  const { user } = useAuth()
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchActivityData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        
        // Buscar dados de atividade do último ano
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        
        const { data, error } = await supabase
          .from('flashcard_reviews')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', oneYearAgo.toISOString())
        
        if (error) {
          console.error('Erro ao buscar dados de atividade:', error)
          setError('Não foi possível carregar os dados de atividade')
          return
        }
        
        // Processar os dados para o formato do mapa de calor
        const activityMap: Record<string, number> = {}
        
        // Inicializar o mapa com todas as datas do último ano
        const today = new Date()
        let currentDate = new Date(oneYearAgo)
        
        while (currentDate <= today) {
          const dateStr = currentDate.toISOString().split('T')[0]
          activityMap[dateStr] = 0
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        // Contar atividades por dia
        if (data) {
          data.forEach(review => {
            const dateStr = new Date(review.created_at).toISOString().split('T')[0]
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1
          })
        }
        
        // Converter para o formato de array
        const formattedData = Object.entries(activityMap).map(([date, count]) => ({
          date,
          count
        }))
        
        setActivityData(formattedData)
      } catch (err) {
        console.error('Erro ao processar dados de atividade:', err)
        setError('Ocorreu um erro ao processar os dados de atividade')
      } finally {
        setLoading(false)
      }
    }
    
    fetchActivityData()
  }, [user])
  
  return { activityData, loading, error }
}
