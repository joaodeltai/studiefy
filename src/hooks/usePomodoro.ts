"use client"

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

interface PomodoroState {
  contentId: string | null
  timeLeft: number
  isRunning: boolean
  sessionStartTime: number | null
}

const STORAGE_KEY = '@studiefy/pomodoro-state'
const TOTAL_TIME = 45 * 60 // 45 minutos em segundos

// Verifica se existe algum pomodoro ativo
const hasActivePomodoro = (): { active: boolean, contentId: string | null } => {
  if (typeof window === 'undefined') return { active: false, contentId: null }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { active: false, contentId: null }

    const state = JSON.parse(saved)
    
    // Se está rodando, calcula o tempo decorrido
    if (state.isRunning && state.sessionStartTime) {
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - state.sessionStartTime) / 1000)
      const timeLeft = Math.max(0, state.timeLeft - elapsedSeconds)
      
      if (timeLeft > 0) {
        return { active: true, contentId: state.contentId }
      }
    }

    return { active: false, contentId: null }
  } catch (error) {
    console.error('Erro ao verificar pomodoro ativo:', error)
    return { active: false, contentId: null }
  }
}

// Carrega o estado do localStorage
const loadState = (): PomodoroState => {
  if (typeof window === 'undefined') return {
    contentId: null,
    timeLeft: TOTAL_TIME,
    isRunning: false,
    sessionStartTime: null
  }

  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return {
    contentId: null,
    timeLeft: TOTAL_TIME,
    isRunning: false,
    sessionStartTime: null
  }

  try {
    const state = JSON.parse(saved)
    
    // Se estava rodando, calcula o tempo decorrido desde a última atualização
    if (state.isRunning && state.sessionStartTime) {
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - state.sessionStartTime) / 1000)
      state.timeLeft = Math.max(0, state.timeLeft - elapsedSeconds)
      
      // Se ainda tem tempo, atualiza o tempo de início para continuar a contagem
      if (state.timeLeft > 0) {
        state.sessionStartTime = now
      } else {
        // Se acabou o tempo, para o timer
        state.isRunning = false
        state.sessionStartTime = null
      }
    }

    return state
  } catch (error) {
    console.error('Erro ao carregar estado do pomodoro:', error)
    return {
      contentId: null,
      timeLeft: TOTAL_TIME,
      isRunning: false,
      sessionStartTime: null
    }
  }
}

// Salva o estado no localStorage
const saveState = (state: PomodoroState) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      // Sempre salva o tempo atual como sessionStartTime se estiver rodando
      sessionStartTime: state.isRunning ? Date.now() : state.sessionStartTime
    }))
  } catch (error) {
    console.error('Erro ao salvar estado do pomodoro:', error)
  }
}

export const usePomodoro = (contentId: string) => {
  const [state, setState] = useState<PomodoroState>(() => {
    const savedState = loadState()
    
    // Se está abrindo um conteúdo diferente, reseta o timer
    if (savedState.contentId !== contentId) {
      return {
        contentId,
        timeLeft: TOTAL_TIME,
        isRunning: false,
        sessionStartTime: null
      }
    }

    return savedState
  })

  const [activePomodoro, setActivePomodoro] = useState(() => hasActivePomodoro())

  // Atualiza o estado do pomodoro ativo quando o componente monta
  useEffect(() => {
    setActivePomodoro(hasActivePomodoro())
  }, [])

  // Salva o estado sempre que mudar
  useEffect(() => {
    saveState(state)
    setActivePomodoro(hasActivePomodoro())
  }, [state])

  // Salva o estado e atualiza o tempo quando a aba fica visível/invisível
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Quando a aba fica invisível, salva o estado atual
        saveState(state)
      } else {
        // Quando a aba fica visível novamente, atualiza o estado
        setState(prev => {
          if (!prev.isRunning) return prev

          const now = Date.now()
          const elapsedSeconds = Math.floor((now - (prev.sessionStartTime || now)) / 1000)
          const newTimeLeft = Math.max(0, prev.timeLeft - elapsedSeconds)

          return {
            ...prev,
            timeLeft: newTimeLeft,
            isRunning: newTimeLeft > 0,
            sessionStartTime: newTimeLeft > 0 ? now : null
          }
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [state])

  // Salva o estado antes da página ser fechada
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveState(state)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state])

  const [totalFocusTime, setTotalFocusTime] = useState(0)

  // Atualiza o timer a cada segundo se estiver rodando
  useEffect(() => {
    if (!state.isRunning) return

    const interval = setInterval(() => {
      setState(prev => {
        const newTimeLeft = Math.max(0, prev.timeLeft - 1)
        // Atualiza o tempo total de foco apenas quando o timer chega a zero
        if (prev.isRunning && prev.timeLeft === 1) {
          setTotalFocusTime(prev => prev + TOTAL_TIME)
        }
        return {
          ...prev,
          timeLeft: newTimeLeft,
          isRunning: newTimeLeft > 0,
          sessionStartTime: newTimeLeft > 0 ? Date.now() : null
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [state.isRunning])

  const toggleTimer = useCallback(() => {
    // Se está tentando iniciar um novo pomodoro
    if (!state.isRunning) {
      // Verifica se já existe um pomodoro ativo em outro conteúdo
      const { active, contentId: activeContentId } = hasActivePomodoro()
      if (active && activeContentId !== contentId) {
        toast.error("Já existe um pomodoro ativo em outro conteúdo")
        return
      }
    } else {
      // Se está parando o timer, adiciona apenas o tempo proporcional ao que foi focado
      const timeSpent = TOTAL_TIME - state.timeLeft
      if (timeSpent > 0) {
        setTotalFocusTime(prev => prev + Math.floor(timeSpent))
      }
    }

    setState(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      sessionStartTime: !prev.isRunning ? Date.now() : null
    }))
  }, [contentId, state.timeLeft])

  const resetTimer = useCallback(() => {
    // Se o timer estava rodando, adiciona apenas o tempo proporcional ao que foi focado
    if (state.isRunning) {
      const timeSpent = TOTAL_TIME - state.timeLeft
      if (timeSpent > 0) {
        setTotalFocusTime(prev => prev + Math.floor(timeSpent))
      }
    }

    setState(prev => ({
      ...prev,
      timeLeft: TOTAL_TIME,
      isRunning: false,
      sessionStartTime: null
    }))
  }, [state.isRunning, state.timeLeft])

  const getFocusedTime = useCallback(() => {
    let focusedTime = totalFocusTime

    // Adiciona o tempo da sessão atual se estiver rodando
    if (state.isRunning && state.sessionStartTime) {
      const currentSessionTime = Math.floor(TOTAL_TIME - state.timeLeft)
      if (currentSessionTime > 0) {
        focusedTime += currentSessionTime
      }
    }

    return focusedTime
  }, [totalFocusTime, state.isRunning, state.timeLeft])

  return {
    timeLeft: state.timeLeft,
    isRunning: state.isRunning,
    toggleTimer,
    resetTimer,
    getFocusedTime
  }
}
