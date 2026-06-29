"use client"
import { createContext, useContext, useState, ReactNode } from 'react'
import { Product } from '@/types'

interface CartItem extends Product {
  qty: number
}

interface Notif {
  id: number
  text: string
  time: string
  read: boolean
}

interface ThriftContextType {
  activeFilter: string
  setActiveFilter: (f: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  cartItems: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (id: number) => void
  cartCount: number
  notifs: Notif[]
  markAllRead: () => void
  unreadCount: number
}

const ThriftContext = createContext<ThriftContextType>({
  activeFilter: 'Semua', setActiveFilter: () => {},
  searchQuery: '', setSearchQuery: () => {},
  cartItems: [], addToCart: () => {}, removeFromCart: () => {},
  cartCount: 0,
  notifs: [], markAllRead: () => {}, unreadCount: 0
})

const defaultNotifs: Notif[] = [
  { id: 1, text: '🛍️ Pesanan kamu sedang diproses!', time: '2 menit lalu', read: false },
  { id: 2, text: '❤️ Produk wishlist kamu hampir habis!', time: '1 jam lalu', read: false },
  { id: 3, text: '🔴 Live shopping dimulai sekarang!', time: '3 jam lalu', read: true },
]

export function ThriftProvider({ children }: { children: ReactNode }) {
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [notifs, setNotifs] = useState<Notif[]>(defaultNotifs)

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const exist = prev.find(i => i.id === product.id)
      if (exist) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(i => i.id !== id))
  }

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)
  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <ThriftContext.Provider value={{
      activeFilter, setActiveFilter,
      searchQuery, setSearchQuery,
      cartItems, addToCart, removeFromCart, cartCount,
      notifs, markAllRead, unreadCount
    }}>
      {children}
    </ThriftContext.Provider>
  )
}

export const useThrift = () => useContext(ThriftContext)
