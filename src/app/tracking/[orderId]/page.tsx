"use client"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getOrders } from '@/lib/orders'
import { supabase } from '@/lib/supabase'

interface TrackingStep {
  status: string
  label: string
  desc: string
  time: string | null
  done: boolean
  active: boolean
}

const statusOrder = ['Pending', 'Diproses', 'Dikirim', 'Selesai']

const stepInfo: Record<string, { label: string; desc: string; icon: string }> = {
  Pending: { label: 'Pesanan Diterima', desc: 'Pesanan kamu sudah masuk dan menunggu konfirmasi penjual', icon: '📋' },
  Diproses: { label: 'Sedang Diproses', desc: 'Penjual sedang menyiapkan paket kamu dengan penuh cinta', icon: '📦' },
  Dikirim: { label: 'Dalam Pengiriman', desc: 'Paket kamu sedang dalam perjalanan menuju alamat tujuan', icon: '🚚' },
  Selesai: { label: 'Pesanan Selesai', desc: 'Paket sudah tiba! Jangan lupa beri ulasan ya 😊', icon: '✅' },
}

const courierInfo = {
  name: 'JNE Express',
  noResi: 'JNE' + Math.random().toString().slice(2, 12),
  estimasi: '2-3 hari kerja'
}

export default function TrackingPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()

    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, payload => {
        setOrder((prev: any) => ({ ...prev, status: payload.new.status }))
      })
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [orderId])

  async function loadOrder() {
    try {
      const orders = await getOrders()
      const found = orders?.find((o: any) => o.id === parseInt(orderId))
      setOrder(found)
    } catch { }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F3FF' }}>
      <div style={{ textAlign: 'center', color: '#7C3AED' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
        <p>Memuat data pesanan...</p>
      </div>
    </div>
  )

  if (!order) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F3FF' }}>
      <div style={{ textAlign: 'center', color: '#999' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>😕</div>
        <p>Pesanan tidak ditemukan</p>
        <button onClick={() => router.push('/orders')} style={{ marginTop: '16px', padding: '10px 20px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Lihat Semua Order</button>
      </div>
    </div>
  )

  const currentStatusIndex = statusOrder.indexOf(order.status)
  const isCancelled = order.status === 'Dibatalkan'

  const steps: TrackingStep[] = statusOrder.map((status, index) => ({
    status,
    label: stepInfo[status].label,
    desc: stepInfo[status].desc,
    time: index <= currentStatusIndex ? new Date(new Date(order.created_at).getTime() + index * 3600000 * 6).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null,
    done: index < currentStatusIndex,
    active: index === currentStatusIndex
  }))

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F3FF', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#7C3AED', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => router.push('/orders')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}>← Kembali</button>
        <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: 0 }}>📍 Lacak Pesanan #{order.id}</h1>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Status Card */}
        <div style={{ backgroundColor: isCancelled ? '#FFEBEE' : '#EDE9FE', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '48px' }}>{isCancelled ? '❌' : stepInfo[order.status]?.icon || '📋'}</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: isCancelled ? '#FF4D4F' : '#7C3AED' }}>
              {isCancelled ? 'Pesanan Dibatalkan' : stepInfo[order.status]?.label}
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
              {isCancelled ? 'Pesanan ini telah dibatalkan' : stepInfo[order.status]?.desc}
            </div>
          </div>
        </div>

        {/* Info Pengiriman */}
        {!isCancelled && order.status !== 'Pending' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700 }}>🚚 Info Pengiriman</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: '#F9F8FF', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>KURIR</div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{courierInfo.name}</div>
              </div>
              <div style={{ backgroundColor: '#F9F8FF', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>ESTIMASI</div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{courierInfo.estimasi}</div>
              </div>
              <div style={{ backgroundColor: '#F9F8FF', borderRadius: '10px', padding: '14px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>NO. RESI</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '1px' }}>{courierInfo.noResi}</div>
                  <button onClick={() => { navigator.clipboard.writeText(courierInfo.noResi); alert('Nomor resi disalin!') }}
                    style={{ padding: '4px 10px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    Salin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {!isCancelled && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 700 }}>📅 Status Pengiriman</h3>
            <div style={{ position: 'relative' }}>
              {steps.map((step, index) => (
                <div key={step.status} style={{ display: 'flex', gap: '16px', marginBottom: index < steps.length - 1 ? '0' : '0', position: 'relative' }}>
                  {/* Line */}
                  {index < steps.length - 1 && (
                    <div style={{ position: 'absolute', left: '19px', top: '40px', width: '2px', height: '60px', backgroundColor: step.done || step.active ? '#7C3AED' : '#EEEEEE', zIndex: 0 }}></div>
                  )}
                  {/* Circle */}
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: step.done ? '#7C3AED' : step.active ? '#EDE9FE' : '#F5F5F5', border: step.active ? '2px solid #7C3AED' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, fontSize: '18px' }}>
                    {step.done ? '✓' : step.active ? stepInfo[step.status].icon : '○'}
                  </div>
                  {/* Content */}
                  <div style={{ paddingBottom: '30px', flex: 1 }}>
                    <div style={{ fontWeight: step.active ? 700 : step.done ? 600 : 400, fontSize: '14px', color: step.done || step.active ? '#333' : '#999' }}>{step.label}</div>
                    {(step.done || step.active) && (
                      <>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{step.desc}</div>
                        {step.time && <div style={{ fontSize: '11px', color: '#7C3AED', marginTop: '4px', fontWeight: 600 }}>{step.time}</div>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Peta Pengiriman Dummy */}
        {!isCancelled && order.status === 'Dikirim' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700 }}>🗺️ Lokasi Paket</h3>
            <div style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative', height: '200px', backgroundColor: '#E8F4FD' }}>
              <svg width="100%" height="200" viewBox="0 0 400 200">
                <rect width="400" height="200" fill="#E8F4FD" />
                {/* Jalan */}
                <line x1="0" y1="100" x2="400" y2="100" stroke="#CBD5E0" strokeWidth="8" />
                <line x1="200" y1="0" x2="200" y2="200" stroke="#CBD5E0" strokeWidth="6" />
                <line x1="0" y1="60" x2="400" y2="140" stroke="#CBD5E0" strokeWidth="4" />
                {/* Blok kota */}
                {[[30,30,60,40],[120,20,50,35],[250,30,70,40],[320,20,60,35],[30,130,55,40],[130,140,60,35],[260,130,65,40],[330,140,50,35]].map(([x,y,w,h], i) => (
                  <rect key={i} x={x} y={y} width={w} height={h} fill="#BEE3F8" rx="4" />
                ))}
                {/* Titik asal */}
                <circle cx="50" cy="100" r="8" fill="#4CAF50" />
                <text x="50" y="88" textAnchor="middle" fontSize="10" fill="#4CAF50" fontWeight="bold">Asal</text>
                {/* Titik tujuan */}
                <circle cx="350" cy="100" r="8" fill="#FF4D4F" />
                <text x="350" y="88" textAnchor="middle" fontSize="10" fill="#FF4D4F" fontWeight="bold">Tujuan</text>
                {/* Titik kurir */}
                <circle cx="200" cy="100" r="12" fill="#7C3AED" />
                <text x="200" y="104" textAnchor="middle" fontSize="14" fill="white">🚚</text>
                {/* Garis rute */}
                <line x1="50" y1="100" x2="200" y2="100" stroke="#7C3AED" strokeWidth="3" strokeDasharray="8,4" />
                <line x1="200" y1="100" x2="350" y2="100" stroke="#EEEEEE" strokeWidth="3" strokeDasharray="8,4" />
              </svg>
              <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(124,58,237,0.9)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                🚚 Paket sedang dalam perjalanan ke {order.customer_address?.split(',')[0]}
              </div>
            </div>
          </div>
        )}

        {/* Detail Pesanan */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700 }}>🧾 Detail Pesanan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {order.items?.map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', backgroundColor: '#F9F8FF', borderRadius: '10px' }}>
                <img src={item.image} alt={item.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Rp {item.price?.toLocaleString('id-ID')} × {item.qty}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #EEEEEE', marginTop: '14px', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Alamat Pengiriman</span>
              <span style={{ fontSize: '13px', fontWeight: 600, textAlign: 'right', maxWidth: '200px' }}>{order.customer_address}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Pembayaran</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{order.payment_method}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#7C3AED' }}>Rp {order.total?.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {order.status === 'Selesai' && (
            <button onClick={() => router.push('/review')}
              style={{ flex: 1, padding: '12px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
              ⭐ Beri Ulasan
            </button>
          )}
          <button onClick={() => router.push('/orders')}
            style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: '#7C3AED', border: '1.5px solid #7C3AED', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
            ← Riwayat Order
          </button>
        </div>
      </div>
    </div>
  )
}
