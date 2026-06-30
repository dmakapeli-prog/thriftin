"use client"
import { useState } from 'react'
import { useThrift } from '@/context/ThriftContext'
import { createOrder } from '@/lib/orders'
import { sendMessage } from '@/lib/messages'
import { useRouter } from 'next/navigation'
import ChatBox from '@/components/ChatBox'

const paymentOptions = [
  { id: 'QRIS (Scan & Pay)', icon: '📱', desc: 'Scan dengan GoPay, OVO, DANA, ShopeePay, BCA' },
  { id: 'Chat Penjual', icon: '💬', desc: 'Bayar dan konfirmasi langsung ke WhatsApp/Chat Penjual' },
  { id: 'Transfer Bank BCA', icon: '🏦', desc: 'No. Rek: 1234567890 a.n ThriftIn Store' },
  { id: 'Transfer Bank Mandiri', icon: '🏦', desc: 'No. Rek: 0987654321 a.n ThriftIn Store' },
  { id: 'E-Wallet (GoPay/OVO/DANA)', icon: '💳', desc: 'Nomor Admin: 0812-3456-7890' }
]

export default function CheckoutPage() {
  const { cartItems, setCartCount } = useThrift()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', address: '', payment: 'QRIS (Scan & Pay)' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [showChat, setShowChat] = useState(false)

  const total = cartItems.reduce((s, i) => s + i.rawPrice * i.qty, 0)

  async function handleCheckout() {
    if (!form.name || !form.address || !form.payment) {
      alert('Lengkapi semua data!')
      return
    }
    if (cartItems.length === 0) {
      alert('Keranjang kosong!')
      return
    }
    setLoading(true)
    try {
      const data = await createOrder({
        customer_name: form.name,
        customer_address: form.address,
        payment_method: form.payment,
        total,
        items: cartItems.map(i => ({
          id: i.id,
          name: i.name,
          price: i.rawPrice,
          qty: i.qty,
          image: i.image
        }))
      })
      const newId = data?.[0]?.id || Math.floor(Math.random() * 9000) + 1000
      setOrderId(newId)
      setCartCount(0)
      setDone(true)
    } catch {
      alert('Gagal membuat pesanan!')
    }
    setLoading(false)
  }

  async function handleKonfirmasiKeChat() {
    let sid = localStorage.getItem('thriftin_session_id')
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
      localStorage.setItem('thriftin_session_id', sid)
    }
    try {
      const msgText = `Halo Admin ThriftIn! Saya sudah checkout Order #${orderId} atas nama ${form.name} senilai Rp ${total.toLocaleString('id-ID')} menggunakan metode ${form.payment}. Mohon dikonfirmasi ya! 😊`
      await sendMessage('Customer', msgText, sid, 'manual')
    } catch {}
    setShowChat(true)
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '460px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#333', margin: '0 0 6px' }}>Pesanan Berhasil!</h2>
          <p style={{ color: '#7C3AED', fontWeight: 700, fontSize: '16px', margin: '0 0 16px' }}>Order #{orderId}</p>
          
          {form.payment.includes('QRIS') && (
            <div style={{ backgroundColor: '#FAF5FF', border: '1.5px dashed #7C3AED', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#7C3AED', marginBottom: '8px' }}>📱 Scan QRIS untuk Pembayaran:</div>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=THRIFTIN_PAYMENT" alt="QRIS ThriftIn" style={{ width: '140px', height: '140px', margin: '0 auto', display: 'block', borderRadius: '8px', border: '4px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#333', marginTop: '10px' }}>Total: Rp {total.toLocaleString('id-ID')}</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Mendukung semua M-Banking & E-Wallet</div>
            </div>
          )}

          <p style={{ color: '#666', marginBottom: '20px', fontSize: '13px' }}>
            Klik tombol di bawah untuk langsung mengabari penjual dan mempercepat proses pengiriman:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={handleKonfirmasiKeChat}
              style={{ padding: '14px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 3px 10px rgba(76,175,80,0.3)' }}>
              💬 Konfirmasi Pesanan ke Chat Penjual
            </button>
            <button onClick={() => router.push('/orders')}
              style={{ padding: '12px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
              📦 Lihat Riwayat Order
            </button>
            <button onClick={() => router.push('/')}
              style={{ padding: '12px', backgroundColor: 'white', color: '#7C3AED', border: '1.5px solid #7C3AED', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
              🛍️ Kembali Belanja
            </button>
          </div>
        </div>

        <ChatBox isOpen={showChat} onClose={() => setShowChat(false)} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F3FF', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#7C3AED', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>← Kembali</button>
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: 0 }}>Checkout Pesanan</h1>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Form */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: 'fit-content' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>📋 Data Penerima</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '6px' }}>Nama Lengkap *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Nama penerima"
              style={{ width: '100%', padding: '12px', border: '1px solid #EEEEEE', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '6px' }}>Alamat Lengkap *</label>
            <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi"
              rows={3}
              style={{ width: '100%', padding: '12px', border: '1px solid #EEEEEE', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '10px' }}>Metode Pembayaran *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {paymentOptions.map(pm => (
                <div key={pm.id} onClick={() => setForm(p => ({ ...p, payment: pm.id }))}
                  style={{ padding: '12px 14px', border: '2px solid', borderColor: form.payment === pm.id ? '#7C3AED' : '#EEEEEE', borderRadius: '10px', backgroundColor: form.payment === pm.id ? '#FAF5FF' : 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{pm.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: form.payment === pm.id ? '#7C3AED' : '#333' }}>{pm.id}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{pm.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>🛒 Ringkasan Pesanan</h2>
            {cartItems.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>Keranjang kosong</p>
            ) : (
              cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #F5F5F5' }}>
                  <img src={item.image} alt={item.name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '13px', color: '#7C3AED', fontWeight: 600 }}>{item.price}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#333', flexShrink: 0 }}>
                    Rp {(item.rawPrice * item.qty).toLocaleString('id-ID')}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Ongkos Kirim</span>
              <span style={{ fontWeight: 600, color: '#4CAF50' }}>Gratis</span>
            </div>
            <div style={{ borderTop: '1px solid #EEEEEE', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>Total Bayar</span>
              <span style={{ fontWeight: 700, fontSize: '18px', color: '#7C3AED' }}>Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <button onClick={handleCheckout} disabled={loading}
              style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#C4B5FD' : '#7C3AED', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '16px', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
              {loading ? 'Memproses...' : '✅ Buat Pesanan Sekarang'}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowChat(!showChat)}
        style={{ position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#7C3AED', color: 'white', padding: '12px 20px', borderRadius: '25px', border: 'none', boxShadow: '0 4px 15px rgba(124,58,237,0.5)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', cursor: 'pointer', zIndex: 90 }}
      >
        <i className="fas fa-comment-dots"></i> Chat Penjual
      </button>

      <ChatBox isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  )
}
