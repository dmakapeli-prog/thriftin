"use client"
import { useState, useEffect } from 'react'
import { useThrift } from '@/context/ThriftContext'
import { products } from '@/data/products'
import ProductCard from './ProductCard'
import ChatBox from './ChatBox'

export default function ProductGrid() {
  const { activeFilter, searchQuery } = useThrift()
  const [showChat, setShowChat] = useState(false)
  const [filtered, setFiltered] = useState(products)

  useEffect(() => {
    let result = [...products]
    if (activeFilter !== 'Semua' && activeFilter !== 'Harga') {
      result = result.filter(p => p.category.includes(activeFilter))
    }
    if (searchQuery.trim()) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    setFiltered(result)
  }, [activeFilter, searchQuery])

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666', gridColumn: '1 / -1' }}>
            <h3>Produk tidak ditemukan</h3>
            <p style={{ marginTop: '8px' }}>Coba gunakan kata kunci atau filter lain.</p>
          </div>
        ) : (
          filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

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
