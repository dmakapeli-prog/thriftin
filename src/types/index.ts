export interface Product {
  id: number
  name: string
  price: string
  rawPrice: number
  image: string
  condition: string
  rating: number
  category: string[]
}

export interface ThriftContextType {
  activeFilter: string
  setActiveFilter: (filter: string) => void
  cartCount: number
  setCartCount: (count: number) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}
