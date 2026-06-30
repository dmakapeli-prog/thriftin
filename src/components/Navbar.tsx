"use client"
import { useState, useRef, useEffect } from 'react'
import { useThrift } from '@/context/ThriftContext'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { cartCount, cartItems, removeFromCart, searchQuery, setSearchQuery, notifs, markAllRead, unreadCount } = useThrift()
  const router = useRouter()
  const [showCart, setShowCart] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const cartRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) setShowCart(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const totalHarga = cartItems.reduce((sum, i) => sum + i.rawPrice * i.qty, 0)

  return (
    <nav style={{ backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        <a href="/" style={{ fontSize: '24px', fontWeight: 700, color: '#7C3AED', textDecoration: 'none', flexShrink: 0 }}>ThriftIn</a>

        <div style={{ flexGrow: 1, maxWidth: '500px', margin: '0 20px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Cari pakaian preloved..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 20px', paddingRight: '40px', border: '1px solid #EEEEEE', borderRadius: '20px', outline: 'none', backgroundColor: '#F5F5F5', fontFamily: 'inherit', fontSize: '14px' }}
          />
          <i className="fas fa-search" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Orders link */}
          <button onClick={() => router.push('/orders')}
            style={{ background: 'none', border: 'none', fontSize: '20px', color: '#333', cursor: 'pointer', padding: '8px' }} title="Riwayat Order">
            <i className="fas fa-receipt"></i>
          </button>

          {/* CART */}
          <div ref={cartRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowCart(!showCart); setShowNotif(false) }}
              style={{ background: 'none', border: 'none', fontSize: '20px', color: '#333', position: 'relative', cursor: 'pointer', padding: '8px' }}
            >
              <i className="fas fa-shopping-cart"></i>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: '#FF4D4F', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '1px 5px', borderRadius: '10px', minWidth: '16px', textAlign: 'center' }}>{cartCount}</span>
              )}
            </button>

            {showCart && (
              <div style={{ position: 'absolute', top: '50px', right: 0, width: '320px', background: 'white', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid #EEEEEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '16px' }}>🛒 Keranjang</span>
                  <span style={{ fontSize: '13px', color: '#7C3AED', fontWeight: 600 }}>{cartCount} item</span>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {cartItems.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                      <i className="fas fa-shopping-cart" style={{ fontSize: '40px', marginBottom: '10px', display: 'block', opacity: 0.3 }}></i>
                      <p>Keranjang masih kosong</p>
                    </div>
                  ) : (
                    cartItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F5F5F5', gap: '12px' }}>
                        <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: '#7C3AED', fontWeight: 600 }}>{item.price}</div>
                          <div style={{ fontSize: '11px', color: '#999' }}>Qty: {item.qty}</div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#FF4D4F', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}>
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {cartItems.length > 0 && (
                  <div style={{ padding: '15px 20px', borderTop: '1px solid #EEEEEE' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>Total</span>
                      <span style={{ fontWeight: 700, color: '#7C3AED', fontSize: '16px' }}>Rp {totalHarga.toLocaleString('id-ID')}</span>
                    </div>
                    <button onClick={() => { setShowCart(false); router.push('/checkout') }}
                      style={{ width: '100%', padding: '12px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                      Checkout Sekarang
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* NOTIF */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowNotif(!showNotif); setShowCart(false); if (!showNotif) markAllRead() }}
              style={{ background: 'none', border: 'none', fontSize: '20px', color: '#333', position: 'relative', cursor: 'pointer', padding: '8px' }}
            >
              <i className="fas fa-bell"></i>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: '#FF4D4F', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '1px 5px', borderRadius: '10px', minWidth: '16px', textAlign: 'center' }}>{unreadCount}</span>
              )}
            </button>

            {showNotif && (
              <div style={{ position: 'absolute', top: '50px', right: 0, width: '300px', background: 'white', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid #EEEEEE' }}>
                  <span style={{ fontWeight: 700, fontSize: '16px' }}>🔔 Notifikasi</span>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifs.map(n => (
                    <div key={n.id} style={{ padding: '14px 20px', borderBottom: '1px solid #F5F5F5', backgroundColor: n.read ? 'white' : '#F5F3FF', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#333', fontWeight: n.read ? 400 : 600 }}>{n.text}</span>
                      <span style={{ fontSize: '11px', color: '#999' }}>{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
