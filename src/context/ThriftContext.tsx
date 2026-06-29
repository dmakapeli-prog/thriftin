"use client"
import { createContext, useContext, useState, ReactNode } from 'react'
import { ThriftContextType } from '@/types'

const ThriftContext = createContext<ThriftContextType | null>(null)

export function ThriftProvider({ children }: { children: ReactNode }) {
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <ThriftContext.Provider value={{ activeFilter, setActiveFilter, cartCount, setCartCount, searchQuery, setSearchQuery }}>
      {children}
    </ThriftContext.Provider>
  )
}

export function useThrift() {
  const ctx = useContext(ThriftContext)
  if (!ctx) throw new Error('useThrift must be used within ThriftProvider')
  return ctx
}
