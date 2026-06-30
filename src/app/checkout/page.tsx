"use client"
import { useState } from 'react'
import { useThrift } from '@/context/ThriftContext'
import { createOrder } from '@/lib/orders'
import { useRouter } from 'next/navigation'

const paymentMethods = ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'BCA', 'Mandiri']

export default function CheckoutPage() {
  const { cartItems, setCartCount } = useThrift()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', address: '', payment: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)

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
      setOrderId(data?.[0]?.id)
      setCartCount(0)
      setDone(true)
    } catch {
      alert('Gagal membuat pesanan!')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', maxWidth: '400px', width: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#333', marginBottom: '8px' }}>Pesanan Berhasil!</h2>
          <p style={{ color: '#666', marginBottom: '8px' }}>Order #{orderId}</p>
          <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>Pesanan kamu sedang diproses oleh penjual.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => router.push('/orders')}
              style={{ padding: '12px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}>
              Lihat Riwayat Order
            </button>
            <button onClick={() => router.push('/')}
              style={{ padding: '12px', backgroundColor: 'white', color: '#7C3AED', border: '1.5px solid #7C3AED', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}>
              Kembali Belanja
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F3FF', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#7C3AED', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>← Kembali</button>
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: 0 }}>Checkout</h1>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Form */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: 'fit-content' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>📋 Data Penerima</h2>
          
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
              rows={4}
              style={{ width: '100%', padding: '12px', border: '1px solid #EEEEEE', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '10px' }}>Metode Pembayaran *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {paymentMethods.map(pm => (
                <button key={pm} onClick={() => setForm(p => ({ ...p, payment: pm }))}
                  style={{ padding: '10px', border: '2px solid', borderColor: form.payment === pm ? '#7C3AED' : '#EEEEEE', borderRadius: '8px', backgroundColor: form.payment === pm ? '#EDE9FE' : 'white', color: form.payment === pm ? '#7C3AED' : '#333', fontWeight: 600, cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}>
                  {pm}
                </button>
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
              <span style={{ fontWeight: 700, fontSize: '16px' }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: '18px', color: '#7C3AED' }}>Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <button onClick={handleCheckout} disabled={loading}
              style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#C4B5FD' : '#7C3AED', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '16px' }}>
              {loading ? 'Memproses...' : '✅ Buat Pesanan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
