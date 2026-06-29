"use client"
import { useState } from 'react'
import { Product } from '@/types'

interface Props {
  product: Product
  onAddToCart: () => void
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const [wishlist, setWishlist] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [offerValue, setOfferValue] = useState('')

  return (
    <>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)' }}
      >
        <div style={{ position: 'relative', height: '250px' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button
            onClick={() => setWishlist(!wishlist)}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.15)', color: wishlist ? '#FF4D4F' : '#CCC', fontSize: '16px', cursor: 'pointer' }}
          >
            <i className={wishlist ? 'fas fa-heart' : 'far fa-heart'}></i>
          </button>
          <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{product.condition}</span>
        </div>
        <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '5px', color: '#333' }}>{product.name}</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#7C3AED', marginBottom: '8px' }}>{product.price}</div>
          <div style={{ fontSize: '13px', color: '#FFB800', marginBottom: '15px' }}>
            <i className="fas fa-star"></i> {product.rating} <span style={{ color: '#666', marginLeft: '5px' }}>/ 5</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            <button
              onClick={onAddToCart}
              style={{ flex: 1, padding: '10px 0', borderRadius: '8px', fontWeight: 600, fontSize: '13px', border: '1.5px solid #7C3AED', color: '#7C3AED', background: 'transparent', cursor: 'pointer' }}
            >Beli Sekarang</button>
            <button
              onClick={() => setShowModal(true)}
              style={{ flex: 1, padding: '10px 0', borderRadius: '8px', fontWeight: 600, fontSize: '13px', background: '#7C3AED', border: '1.5px solid #7C3AED', color: 'white', cursor: 'pointer' }}
            >Tawar Harga</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', color: '#666', cursor: 'pointer' }}>
              <i className="fas fa-times"></i>
            </button>
            <h2 style={{ marginBottom: '10px', fontSize: '20px' }}>Tawar Harga</h2>
            <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>Produk: {product.name}</p>
            <label style={{ fontSize: '14px', color: '#333' }}>Masukkan Harga Penawaran Anda:</label>
            <input
              type="number"
              placeholder="Misal: 200000"
              value={offerValue}
              onChange={(e) => setOfferValue(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #EEEEEE', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', marginTop: '8px', marginBottom: '15px', fontSize: '14px' }}
            />
            <button
              onClick={() => { setShowModal(false); setOfferValue(''); alert('Penawaran Anda telah dikirim ke penjual!') }}
              style={{ width: '100%', padding: '12px', background: '#7C3AED', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
            >Kirim Penawaran</button>
          </div>
        </div>
      )}
    </>
  )
}
