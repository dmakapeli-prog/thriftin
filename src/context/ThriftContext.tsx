"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/types'
import { getNotifications, markAllNotifsAsRead, subscribeNotifications } from '@/lib/notifications'

interface CartItem extends Product {
  qty: number
}

interface Notif {
  id: number
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

interface ThriftContextType {
  activeFilter: string
  setActiveFilter: (f: string) => void
  activeType: string
  setActiveType: (t: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  cartItems: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (id: number) => void
  setCartCount: (count: number) => void
  cartCount: number
  notifs: Notif[]
  markAllRead: () => void
  unreadCount: number
}

const ThriftContext = createContext<ThriftContextType>({
  activeFilter: 'Semua', setActiveFilter: () => {},
  activeType: 'Semua Tipe', setActiveType: () => {},
  searchQuery: '', setSearchQuery: () => {},
  cartItems: [], addToCart: () => {}, removeFromCart: () => {}, setCartCount: () => {},
  cartCount: 0,
  notifs: [], markAllRead: () => {}, unreadCount: 0
})

export function ThriftProvider({ children }: { children: ReactNode }) {
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [activeType, setActiveType] = useState('Semua Tipe')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [notifs, setNotifs] = useState<Notif[]>([])

  useEffect(() => {
    // Load notifikasi dari Supabase
    getNotifications().then(data => setNotifs(data || []))

    // Subscribe realtime
    const channel = subscribeNotifications((newNotif) => {
      setNotifs(prev => [newNotif, ...prev])
      // Tampilkan browser notification kalau ada permission
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotif.title, { body: newNotif.message })
      }
    })

    // Minta permission browser notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => { channel.unsubscribe() }
  }, [])

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

  const setCartCount = (count: number) => {
    if (count === 0) setCartItems([])
  }

  const markAllRead = async () => {
    await markAllNotifsAsRead()
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)
  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <ThriftContext.Provider value={{
      activeFilter, setActiveFilter,
      activeType, setActiveType,
      searchQuery, setSearchQuery,
      cartItems, addToCart, removeFromCart, setCartCount, cartCount,
      notifs, markAllRead, unreadCount
    }}>
      {children}
    </ThriftContext.Provider>
  )
}

export const useThrift = () => useContext(ThriftContext)
