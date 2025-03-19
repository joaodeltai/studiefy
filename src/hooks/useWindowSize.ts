'use client'

import { useState, useEffect } from 'react'

interface WindowSize {
  width: number
  height: number
}

export function useWindowSize(): WindowSize {
  // Estado inicial com valores padrão
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  })

  useEffect(() => {
    // Função para atualizar o tamanho da janela
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    
    // Verificar se estamos no navegador
    if (typeof window !== 'undefined') {
      // Adicionar listener para redimensionamento
      window.addEventListener('resize', handleResize)
      
      // Chamar uma vez para definir o tamanho inicial
      handleResize()
      
      // Remover listener ao desmontar
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return windowSize
}
