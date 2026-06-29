"use client"
import { createContext, useContext, useState, ReactNode } from 'react'

interface ThriftContextType {
  activeFilter: string
  setActiveFilter: (filter: string) => void
  cartCount: number
  setCartCount: (count: number) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const ThriftContext = createContext<ThriftContextType>({
  activeFilter: 'Semua',
  setActiveFilter: () => {},
  cartCount: 0,
  setCartCount: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
})

export function ThriftProvider({ children }: { children: ReactNode }) {
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <ThriftContext.Provider value={{
      activeFilter, setActiveFilter,
      cartCount, setCartCount,
      searchQuery, setSearchQuery
    }}>
      {children}
    </ThriftContext.Provider>
  )
}

export const useThrift = () => useContext(ThriftContext)
