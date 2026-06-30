"use client"
import { useState, useEffect } from 'react'
import { getOrders } from '@/lib/orders'
import { useRouter } from 'next/navigation'
import ChatBox from '@/components/ChatBox'

interface Order {
  id: number
  customer_name: string
  customer_address: string
  payment_method: string
  status: string
  total: number
  items: any[]
  created_at: string
}

const statusColor: Record<string, string> = {
  'Pending': '#FFB800',
  'Diproses': '#2196F3',
  'Dikirim': '#9C27B0',
  'Selesai': '#4CAF50',
  'Dibatalkan': '#FF4D4F'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)
  const [showChat, setShowChat] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrders()
        setOrders(data || [])
      } catch { }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F3FF', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ backgroundColor: '#7C3AED', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>← Kembali</button>
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: 0 }}>📦 Riwayat Order</h1>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#7C3AED' }}>⏳ Memuat orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <h3 style={{ color: '#333' }}>Belum ada pesanan</h3>
            <button onClick={() => router.push('/')}
              style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => (
              <div key={order.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                onClick={() => setSelected(order)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>Order #{order.id}</div>
                    <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span style={{ backgroundColor: statusColor[order.status] + '20', color: statusColor[order.status], padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                    {order.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {order.items?.map((item: any, i: number) => (
                    <img key={i} src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #EEEEEE' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>{order.items?.length} produk • {order.payment_method}</div>
                  <div style={{ fontWeight: 700, color: '#7C3AED', fontSize: '16px' }}>Rp {order.total.toLocaleString('id-ID')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Detail Order #{selected.id}</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#999' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: '#F9F8FF', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>STATUS</div>
                <span style={{ backgroundColor: statusColor[selected.status] + '20', color: statusColor[selected.status], padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>{selected.status}</span>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#F9F8FF', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>PENERIMA</div>
                <div style={{ fontWeight: 600 }}>{selected.customer_name}</div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{selected.customer_address}</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#F9F8FF', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>PRODUK</div>
                {selected.items?.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <img src={item.image} alt={item.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>Rp {item.price.toLocaleString('id-ID')} × {item.qty}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px', backgroundColor: '#F9F8FF', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 700, color: '#7C3AED', fontSize: '16px' }}>Rp {selected.total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
