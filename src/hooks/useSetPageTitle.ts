'use client'

import { useEffect } from 'react'
import { usePageTitle } from '@/contexts/PageTitleContext'

/**
 * Hook para definir o título da página no header global
 * @param title Título da página
 */
export function useSetPageTitle(title: string) {
  const { setPageTitle } = usePageTitle()
  
  useEffect(() => {
    setPageTitle(title)
    
    // Limpar o título quando o componente for desmontado
    return () => setPageTitle('')
  }, [title, setPageTitle])
}
