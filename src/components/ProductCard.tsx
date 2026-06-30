"use client"
import { useState, useEffect } from 'react'
import { Product } from '@/types'
import { useThrift } from '@/context/ThriftContext'
import { createOffer } from '@/lib/offers'
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist'
import ReviewSection from './ReviewSection'
import { getProductAvgRating } from '@/lib/reviews'
import { useRouter } from 'next/navigation'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addToCart, setCartCount, cartCount } = useThrift()
  const router = useRouter()
  const [wishlist, setWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const [dynamicRating, setDynamicRating] = useState({ avg: product.rating, count: 0 })
  const [offerValue, setOfferValue] = useState('')
  const [offerName, setOfferName] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [offerDone, setOfferDone] = useState(false)

  useEffect(() => {
    isInWishlist(product.id).then(setWishlist)
    getProductAvgRating(product.id).then(result => {
      if (result.count > 0) setDynamicRating(result)
    })
  }, [product.id])

  async function handleToggleWishlist() {
    setWishlistLoading(true)
    try {
      if (wishlist) {
        await removeFromWishlist(product.id)
        setWishlist(false)
      } else {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image
        })
        setWishlist(true)
        showToastMsg('❤️ Ditambahkan ke wishlist!')
      }
    } catch { }
    setWishlistLoading(false)
  }

  function showToastMsg(msg: string) {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  function handleTambahKeranjang() {
    addToCart(product)
    showToastMsg(`✅ ${product.name} ditambahkan ke keranjang!`)
  }

  function handleBeliSekarang() {
    addToCart(product)
    router.push('/checkout')
  }

  async function handleSubmitOffer() {
    if (!offerValue || !offerName) {
      alert('Lengkapi nama dan harga penawaran!')
      return
    }
    setSubmitting(true)
    try {
      await createOffer({
        product_id: product.id,
        product_name: product.name,
        offer_price: parseInt(offerValue),
        customer_name: offerName
      })
      setOfferDone(true)
    } catch {
      alert('Gagal mengirim penawaran!')
    }
    setSubmitting(false)
  }

  function closeOfferModal() {
    setShowModal(false)
    setOfferDone(false)
    setOfferValue('')
    setOfferName('')
  }

  return (
    <>
      <div
        style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
      >
        <div style={{ position: 'relative', height: '250px' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button onClick={handleToggleWishlist} disabled={wishlistLoading} style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.15)', color: wishlist ? '#FF4D4F' : '#CCC', fontSize: '16px', cursor: wishlistLoading ? 'wait' : 'pointer' }}>
            <i className={wishlist ? 'fas fa-heart' : 'far fa-heart'}></i>
          </button>
          <span style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: product.product_type === 'Preloved' ? '#7C3AED' : '#4CAF50',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 700
          }}>
            {product.product_type === 'Preloved' ? '✨ Preloved' : '♻️ Thrift'}
          </span>
          <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{product.condition}</span>
        </div>
        <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '5px', color: '#333' }}>{product.name}</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#7C3AED', marginBottom: '8px' }}>{product.price}</div>
          <div onClick={() => setShowReviews(true)} style={{ fontSize: '13px', color: '#FFB800', marginBottom: '12px', cursor: 'pointer' }}>
            <i className="fas fa-star"></i> {dynamicRating.avg || product.rating} <span style={{ color: '#666', marginLeft: '5px' }}>/ 5 {dynamicRating.count > 0 && `(${dynamicRating.count} ulasan)`}</span>
          </div>

          <button onClick={handleBeliSekarang}
            style={{ width: '100%', padding: '11px 0', borderRadius: '8px', fontWeight: 700, fontSize: '13px', background: '#7C3AED', border: 'none', color: 'white', cursor: 'pointer', marginBottom: '8px' }}>
            ⚡ Beli Sekarang
          </button>
          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <button onClick={handleTambahKeranjang}
              style={{ flex: 1, padding: '9px 0', borderRadius: '8px', fontWeight: 600, fontSize: '12px', border: '1.5px solid #7C3AED', color: '#7C3AED', background: 'transparent', cursor: 'pointer' }}>
              🛒 + Keranjang
            </button>
            <button onClick={() => setShowModal(true)}
              style={{ flex: 1, padding: '9px 0', borderRadius: '8px', fontWeight: 600, fontSize: '12px', background: '#EDE9FE', border: '1.5px solid #EDE9FE', color: '#7C3AED', cursor: 'pointer' }}>
              💬 Tawar Harga
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: showToast ? '30px' : '-100px', left: '50%', transform: 'translateX(-50%)', background: '#4CAF50', color: 'white', padding: '12px 25px', borderRadius: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'bottom 0.3s', zIndex: 1000, fontWeight: 500, whiteSpace: 'nowrap' }}>
        {toastMsg}
      </div>

      {/* Modal Tawar Harga */}
      {showModal && (
        <div onClick={closeOfferModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={closeOfferModal} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', color: '#666', cursor: 'pointer' }}>
              <i className="fas fa-times"></i>
            </button>

            {offerDone ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                <h3 style={{ marginBottom: '8px' }}>Penawaran Terkirim!</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                  Penjual akan meninjau penawaran kamu untuk <b>{product.name}</b>. Cek status di halaman riwayat order kamu nanti.
                </p>
                <button onClick={closeOfferModal}
                  style={{ width: '100%', padding: '12px', background: '#7C3AED', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  Tutup
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ marginBottom: '10px', fontSize: '20px' }}>💬 Tawar Harga</h2>
                <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>Produk: <b>{product.name}</b> ({product.price})</p>
                
                <label style={{ fontSize: '14px', color: '#333' }}>Nama Kamu:</label>
                <input
                  type="text"
                  placeholder="contoh: Budi"
                  value={offerName}
                  onChange={(e) => setOfferName(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #EEEEEE', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', marginTop: '6px', marginBottom: '15px', fontSize: '14px', boxSizing: 'border-box' }}
                />

                <label style={{ fontSize: '14px', color: '#333' }}>Harga Penawaran:</label>
                <input
                  type="number"
                  placeholder="Misal: 200000"
                  value={offerValue}
                  onChange={(e) => setOfferValue(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #EEEEEE', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', marginTop: '6px', marginBottom: '15px', fontSize: '14px', boxSizing: 'border-box' }}
                />
                <button onClick={handleSubmitOffer} disabled={submitting}
                  style={{ width: '100%', padding: '12px', background: submitting ? '#C4B5FD' : '#7C3AED', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Mengirim...' : 'Kirim Penawaran'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showReviews && <ReviewSection productId={product.id} onClose={() => setShowReviews(false)} />}
    </>
  )
}
