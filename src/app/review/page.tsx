"use client"
import { useState } from 'react'
import { getReviewableOrders, createReview, uploadReviewPhoto } from '@/lib/reviews'
import { useRouter } from 'next/navigation'

export default function ReviewPage() {
  const router = useRouter()
  const [searchName, setSearchName] = useState('')
  const [reviewableItems, setReviewableItems] = useState<any[]>([])
  const [searched, setSearched] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSearch() {
    if (!searchName.trim()) return
    try {
      const items = await getReviewableOrders(searchName.trim())
      setReviewableItems(items)
      setSearched(true)
    } catch { }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!comment.trim()) {
      alert('Tulis komentar dulu ya!')
      return
    }
    setSubmitting(true)
    try {
      let photo_url = undefined
      if (photoFile) {
        photo_url = await uploadReviewPhoto(photoFile)
      }
      await createReview({
        product_id: selectedItem.product_id,
        order_id: selectedItem.order_id,
        customer_name: searchName.trim(),
        rating,
        comment,
        photo_url
      })
      setDone(true)
    } catch {
      alert('Gagal mengirim ulasan!')
    }
    setSubmitting(false)
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Ulasan Terkirim!</h2>
          <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>Terima kasih sudah memberi ulasan untuk {selectedItem.product_name}</p>
          <button onClick={() => router.push('/')} style={{ width: '100%', padding: '12px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
            Kembali ke Toko
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F3FF', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ backgroundColor: '#7C3AED', padding: '16px 24px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>← Kembali</button>
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: '8px 0 0' }}>⭐ Beri Ulasan</h1>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px' }}>

        {!selectedItem ? (
          <>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>Masukkan nama yang kamu pakai saat checkout:</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={searchName} onChange={e => setSearchName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Nama lengkap kamu..."
                  style={{ flex: 1, padding: '12px', border: '1px solid #EEEEEE', borderRadius: '8px', outline: 'none', fontSize: '14px' }} />
                <button onClick={handleSearch} style={{ padding: '12px 20px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cari</button>
              </div>
            </div>

            {searched && (
              reviewableItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '16px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                  <p style={{ color: '#999' }}>Tidak ada produk yang bisa diulas. Pastikan nama sesuai saat checkout dan pesanan sudah Selesai/Dikirim.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reviewableItems.map((item, i) => (
                    <button key={i} onClick={() => setSelectedItem(item)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', borderRadius: '12px', padding: '14px', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <img src={item.product_image} alt={item.product_name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.product_name}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>Order #{item.order_id}</div>
                      </div>
                      <i className="fas fa-chevron-right" style={{ color: '#7C3AED' }}></i>
                    </button>
                  ))}
                </div>
              )
            )}
          </>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <img src={selectedItem.product_image} alt={selectedItem.product_name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ fontWeight: 600 }}>{selectedItem.product_name}</div>
            </div>

            <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Rating</label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)}
                  style={{ background: 'none', border: 'none', fontSize: '32px', cursor: 'pointer', color: star <= rating ? '#FFB800' : '#DDD' }}>
                  ★
                </button>
              ))}
            </div>

            <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Komentar</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
              placeholder="Bagaimana kualitas produknya?"
              style={{ width: '100%', padding: '12px', border: '1px solid #EEEEEE', borderRadius: '8px', outline: 'none', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box', resize: 'vertical' }} />

            <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Foto (opsional)</label>
            <div onClick={() => document.getElementById('reviewPhoto')?.click()}
              style={{ border: '2px dashed #C4B5FD', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#FAF5FF', marginBottom: '20px' }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', margin: '0 auto' }} />
              ) : (
                <p style={{ color: '#7C3AED', fontSize: '13px', margin: 0 }}>📸 Klik untuk upload foto</p>
              )}
              <input id="reviewPhoto" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setSelectedItem(null)} style={{ flex: 1, padding: '12px', backgroundColor: 'white', border: '1.5px solid #EEEEEE', color: '#666', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ flex: 2, padding: '12px', backgroundColor: submitting ? '#C4B5FD' : '#7C3AED', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
