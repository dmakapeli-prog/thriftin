"use client"
import { useState, useEffect } from 'react'
import { getWishlist, removeFromWishlist } from '@/lib/wishlist'
import { useThrift } from '@/context/ThriftContext'
import { useRouter } from 'next/navigation'

interface WishlistItem {
  id: number
  product_id: number
  product_name: string
  product_price: string
  product_image: string
  created_at: string
}

export default function WishlistPage() {
  const { addToCart } = useThrift()
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await getWishlist()
      setItems(data || [])
    } catch { }
    setLoading(false)
  }

  async function handleRemove(productId: number) {
    try {
      await removeFromWishlist(productId)
      setItems(prev => prev.filter(i => i.product_id !== productId))
    } catch { }
  }

  function handleBeli(item: WishlistItem) {
    const rawPrice = parseInt(item.product_price.replace(/\D/g, '')) || 0
    addToCart({
      id: item.product_id,
      name: item.product_name,
      price: item.product_price,
      rawPrice,
      image: item.product_image,
      condition: 'Condition: Good',
      rating: 4.5,
      category: []
    })
    router.push('/checkout')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F3FF', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ backgroundColor: '#7C3AED', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>← Kembali</button>
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: 0 }}>❤️ Wishlist Saya</h1>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#7C3AED' }}>⏳ Memuat wishlist...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '16px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💔</div>
            <h3 style={{ color: '#333', marginBottom: '8px' }}>Wishlist masih kosong</h3>
            <p style={{ color: '#999', marginBottom: '20px', fontSize: '14px' }}>Simpan produk favorit kamu dengan klik ikon ❤️ di produk</p>
            <button onClick={() => router.push('/')}
              style={{ padding: '12px 24px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {items.map(item => (
              <div key={item.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ position: 'relative', height: '180px' }}>
                  <img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => handleRemove(item.product_id)}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.15)', color: '#FF4D4F', cursor: 'pointer' }}>
                    <i className="fas fa-heart"></i>
                  </button>
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{item.product_name}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#7C3AED', marginBottom: '12px' }}>{item.product_price}</div>
                  <button onClick={() => handleBeli(item)}
                    style={{ width: '100%', padding: '9px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                    ⚡ Beli Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
