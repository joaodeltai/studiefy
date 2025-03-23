'use client'

import { createContext, useContext, useState, ReactNode, ReactElement } from 'react'

type PageTitleContextType = {
  pageTitle: string
  setPageTitle: (title: string) => void
  titleElement: ReactElement | null
  setTitleElement: (element: ReactElement | null) => void
  titleActions: ReactElement | null
  setTitleActions: (actions: ReactElement | null) => void
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined)

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState('')
  const [titleElement, setTitleElement] = useState<ReactElement | null>(null)
  const [titleActions, setTitleActions] = useState<ReactElement | null>(null)

  return (
    <PageTitleContext.Provider value={{ 
      pageTitle, 
      setPageTitle, 
      titleElement, 
      setTitleElement,
      titleActions,
      setTitleActions
    }}>
      {children}
    </PageTitleContext.Provider>
  )
}

export function usePageTitle() {
  const context = useContext(PageTitleContext)
  
  if (context === undefined) {
    throw new Error('usePageTitle must be used within a PageTitleProvider')
  }
  
  return context
}
