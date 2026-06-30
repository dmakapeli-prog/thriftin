"use client"
import { useState, useEffect } from 'react'
import { useThrift } from '@/context/ThriftContext'
import { getProducts } from '@/lib/products'
import ProductCard from './ProductCard'
import ChatBox from './ChatBox'

interface Product {
  id: number
  name: string
  price: string
  raw_price: number
  image_url: string
  condition: string
  rating: number
  category: string[]
  stok: number
  product_type?: string
}

export default function ProductGrid() {
  const { activeFilter, activeType, searchQuery } = useThrift()
  const [showChat, setShowChat] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getProducts()
        setAllProducts(data || [])
      } catch {
        console.error('Gagal load produk')
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let result = [...allProducts]
    if (activeType !== 'Semua Tipe') {
      result = result.filter(p => p.product_type === activeType)
    }
    if (activeFilter !== 'Semua' && activeFilter !== 'Harga') {
      result = result.filter(p => (p.category || []).includes(activeFilter))
    }
    if (searchQuery.trim()) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    setFiltered(result)
  }, [activeFilter, activeType, searchQuery, allProducts])

  return (
    <>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#7C3AED', fontSize: '16px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
          Memuat produk...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
              <h3>Produk tidak ditemukan</h3>
              <p style={{ marginTop: '8px' }}>Coba gunakan kata kunci atau filter lain.</p>
            </div>
          ) : (
            filtered.map(product => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  rawPrice: product.raw_price,
                  image: product.image_url,
                  condition: `Condition: ${product.condition}`,
                  rating: product.rating,
                  category: product.category || [],
                  product_type: product.product_type || 'Thrift'
                }}
              />
            ))
          )}
        </div>
      )}

      <button
        onClick={() => setShowChat(!showChat)}
        style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#7C3AED', color: 'white', padding: '12px 20px', borderRadius: '25px', border: 'none', boxShadow: '0 4px 15px rgba(124,58,237,0.5)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', cursor: 'pointer', zIndex: 90 }}
      >
        <i className="fas fa-comment-dots"></i> Chat Penjual
      </button>

      <ChatBox isOpen={showChat} onClose={() => setShowChat(false)} />
    </>
  )
}
