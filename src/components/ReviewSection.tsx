"use client"
import { useState, useEffect } from 'react'
import { getProductReviews } from '@/lib/reviews'

interface Review {
  id: number
  customer_name: string
  rating: number
  comment: string
  photo_url: string | null
  created_at: string
}

export default function ReviewSection({ productId, onClose }: { productId: number, onClose: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getProductReviews(productId)
        setReviews(data || [])
      } catch { }
      setLoading(false)
    }
    load()
  }, [productId])

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0'

  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEEEEE', position: 'sticky', top: 0, backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>⭐ Ulasan Produk</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>{avgRating} dari {reviews.length} ulasan</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#999' }}>×</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>Memuat ulasan...</p>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📝</div>
              <p style={{ color: '#999' }}>Belum ada ulasan untuk produk ini</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map(review => (
                <div key={review.id} style={{ borderBottom: '1px solid #F5F5F5', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{review.customer_name}</span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ color: '#FFB800', fontSize: '14px', marginBottom: '8px' }}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <p style={{ fontSize: '14px', color: '#333', marginBottom: review.photo_url ? '10px' : 0 }}>{review.comment}</p>
                  {review.photo_url && (
                    <img src={review.photo_url} alt="Review photo" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
