"use client"
import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImage } from '@/lib/products'
import { getOrders, updateOrderStatus } from '@/lib/orders'
import { getOffers, updateOfferStatus } from '@/lib/offers'
import { getAllSessions, sendMessage, subscribeMessages } from '@/lib/messages'
import { supabase } from '@/lib/supabase'

interface Product {
  id: number
  name: string
  price: string
  raw_price: number
  image_url: string
  condition: string
  rating: number
  category: string[]
  stok: number
}

const emptyForm = {
  name: '',
  price: '',
  raw_price: 0,
  image_url: '',
  condition: 'Good',
  rating: 4.5,
  category: [] as string[],
  stok: 1
}

const categoryOptions = ['Pria', 'Wanita', 'Aksesoris', 'Merek']

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const [activeTab, setActiveTab] = useState<'produk' | 'pesanan' | 'tawaran' | 'chat'>('produk')
  const [orders, setOrders] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingOffers, setLoadingOffers] = useState(true)

  const [allMessages, setAllMessages] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [adminInput, setAdminInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(true)

  useEffect(() => { loadProducts() }, [])

  useEffect(() => {
    loadOrders()
    loadOffers()
  }, [])

  useEffect(() => {
    loadAllMessages()
    const channel = subscribeMessages('admin-listen-all', () => {})
    
    const globalChannel = supabase
      .channel('admin-all-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
        setAllMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
      globalChannel.unsubscribe()
    }
  }, [])

  async function loadProducts() {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data || [])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('Load error:', msg)
      showToast(`Gagal memuat produk: ${msg}`)
    }
    setLoading(false)
  }

  async function loadOrders() {
    setLoadingOrders(true)
    try {
      const data = await getOrders()
      setOrders(data || [])
    } catch { }
    setLoadingOrders(false)
  }

  async function loadOffers() {
    setLoadingOffers(true)
    try {
      const data = await getOffers()
      setOffers(data || [])
    } catch { }
    setLoadingOffers(false)
  }

  async function loadAllMessages() {
    setLoadingChat(true)
    try {
      const data = await getAllSessions()
      setAllMessages(data || [])
    } catch { }
    setLoadingChat(false)
  }

  async function handleAdminReply() {
    if (!adminInput.trim() || !selectedSession) return
    try {
      await sendMessage('Penjual', adminInput, selectedSession, 'manual')
      setAdminInput('')
    } catch { }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleUpdateOrderStatus(id: number, status: string) {
    try {
      await updateOrderStatus(id, status)
      showToast(`✅ Status order #${id} diubah jadi ${status}`)
      loadOrders()
    } catch {
      showToast('❌ Gagal update status')
    }
  }

  async function handleUpdateOfferStatus(id: number, status: string) {
    try {
      await updateOfferStatus(id, status)
      showToast(`✅ Penawaran ${status === 'Diterima' ? 'diterima' : 'ditolak'}`)
      loadOffers()
    } catch {
      showToast('❌ Gagal update penawaran')
    }
  }

  function openAdd() {
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview('')
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      price: p.price,
      raw_price: p.raw_price,
      image_url: p.image_url,
      condition: p.condition,
      rating: p.rating,
      category: p.category || [],
      stok: p.stok
    })
    setImagePreview(p.image_url)
    setImageFile(null)
    setEditId(p.id)
    setShowForm(true)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function toggleCategory(cat: string) {
    setForm(prev => ({
      ...prev,
      category: prev.category.includes(cat)
        ? prev.category.filter(c => c !== cat)
        : [...prev.category, cat]
    }))
  }

  function handlePriceChange(val: string) {
    const raw = parseInt(val.replace(/\D/g, '')) || 0
    const formatted = 'Rp ' + raw.toLocaleString('id-ID')
    setForm(prev => ({ ...prev, price: formatted, raw_price: raw }))
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      showToast('Nama dan harga wajib diisi!')
      return
    }
    setSaving(true)
    try {
      let image_url = form.image_url
      if (imageFile) {
        image_url = await uploadImage(imageFile)
      }
      const payload = { ...form, image_url }
      if (editId) {
        await updateProduct(editId, payload)
        showToast('✅ Produk berhasil diupdate!')
      } else {
        await createProduct(payload)
        showToast('✅ Produk berhasil ditambahkan!')
      }
      setShowForm(false)
      loadProducts()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('Save error:', msg)
      showToast(`❌ Gagal: ${msg}`)
    }
    setSaving(false)
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Hapus produk "${name}"?`)) return
    try {
      await deleteProduct(id)
      showToast('🗑️ Produk dihapus!')
      loadProducts()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('Delete error:', msg)
      showToast(`❌ Gagal hapus: ${msg}`)
    }
  }

  const manualSessions = Array.from(new Set(allMessages.filter(m => m.mode === 'manual' && m.session_id).map(m => m.session_id)))
  const unrepliedChatCount = manualSessions.filter(sid => {
    const sessionMsgs = allMessages.filter(m => m.session_id === sid).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const lastMsg = sessionMsgs[sessionMsgs.length - 1]
    return lastMsg && (lastMsg.sender === 'Customer' || lastMsg.sender === 'System')
  }).length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F3FF', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ backgroundColor: '#7C3AED', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', opacity: 0.8 }}>← Kembali ke Toko</a>
          <span style={{ color: 'white', opacity: 0.4 }}>|</span>
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: 0 }}>🛍️ Admin Panel ThriftIn</h1>
        </div>
        <button
          onClick={openAdd}
          style={{ backgroundColor: 'white', color: '#7C3AED', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
        >+ Tambah Produk</button>
      </div>

      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #EEEEEE', display: 'flex', gap: '4px', padding: '0 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {[
          { key: 'produk', label: '📦 Produk', count: products.length },
          { key: 'pesanan', label: '🧾 Pesanan Masuk', count: orders.filter(o => o.status === 'Pending').length },
          { key: 'tawaran', label: '💬 Tawaran Harga', count: offers.filter(o => o.status === 'Pending').length },
          { key: 'chat', label: '💬 Chat Customer', count: unrepliedChatCount },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '14px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #7C3AED' : '3px solid transparent',
              color: activeTab === tab.key ? '#7C3AED' : '#666',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{ backgroundColor: '#FF4D4F', color: 'white', fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px' }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        {activeTab === 'produk' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Produk', value: products.length, icon: '📦' },
                { label: 'Total Stok', value: products.reduce((s, p) => s + (p.stok || 0), 0), icon: '🏷️' },
                { label: 'Stok Habis', value: products.filter(p => p.stok === 0).length, icon: '⚠️' },
              ].map(stat => (
                <div key={stat.label} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#7C3AED' }}>{stat.value}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Product Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEEEEE' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Daftar Produk</h2>
              </div>
              {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#7C3AED', fontSize: '16px' }}>Memuat produk...</div>
              ) : products.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                  <p>Belum ada produk. Tambahkan produk pertama kamu!</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F9F8FF' }}>
                        {['Foto', 'Nama Produk', 'Harga', 'Kondisi', 'Stok', 'Kategori', 'Aksi'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#666', borderBottom: '1px solid #EEEEEE' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #F5F5F5' }}
                          onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#FAFAFA'}
                          onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'white'}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <img src={p.image_url || 'https://via.placeholder.com/60'} alt={p.name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #EEEEEE' }} />
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px', maxWidth: '200px' }}>{p.name}</td>
                          <td style={{ padding: '12px 16px', color: '#7C3AED', fontWeight: 700, fontSize: '14px' }}>{p.price}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ backgroundColor: '#EDE9FE', color: '#7C3AED', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{p.condition}</span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ color: p.stok === 0 ? '#FF4D4F' : '#333', fontWeight: 600, fontSize: '14px' }}>{p.stok === 0 ? '⚠️ Habis' : p.stok}</span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '12px', color: '#666' }}>{(p.category || []).join(', ')}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => openEdit(p)} style={{ backgroundColor: '#EDE9FE', color: '#7C3AED', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>✏️ Edit</button>
                              <button onClick={() => handleDelete(p.id, p.name)} style={{ backgroundColor: '#FFF0F0', color: '#FF4D4F', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>🗑️ Hapus</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'pesanan' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEEEEE' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>🧾 Pesanan Masuk</h2>
            </div>
            {loadingOrders ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#7C3AED' }}>Memuat pesanan...</div>
            ) : orders.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                <p>Belum ada pesanan masuk.</p>
              </div>
            ) : (
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map(order => (
                  <div key={order.id} style={{ border: '1px solid #EEEEEE', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>Order #{order.id} — {order.customer_name}</div>
                        <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>
                          {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>📍 {order.customer_address}</div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>💳 {order.payment_method}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#7C3AED', fontSize: '16px' }}>Rp {order.total.toLocaleString('id-ID')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F9F8FF', padding: '4px 8px', borderRadius: '6px' }}>
                          <img src={item.image} alt={item.name} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />
                          <span style={{ fontSize: '12px' }}>{item.name} x{item.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #EEEEEE', fontSize: '13px', fontWeight: 600, color: '#7C3AED', backgroundColor: '#F9F8FF', cursor: 'pointer' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Dikirim">Dikirim</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tawaran' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEEEEE' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>💬 Tawaran Harga</h2>
            </div>
            {loadingOffers ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#7C3AED' }}>Memuat tawaran...</div>
            ) : offers.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                <p>Belum ada tawaran harga masuk.</p>
              </div>
            ) : (
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {offers.map(offer => (
                  <div key={offer.id} style={{ border: '1px solid #EEEEEE', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{offer.product_name}</div>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Dari: {offer.customer_name}</div>
                      <div style={{ fontSize: '13px', color: '#999', marginTop: '2px' }}>
                        {new Date(offer.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#7C3AED', fontSize: '18px' }}>
                      Rp {offer.offer_price.toLocaleString('id-ID')}
                    </div>
                    <div>
                      {offer.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleUpdateOfferStatus(offer.id, 'Diterima')}
                            style={{ padding: '8px 14px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                            ✅ Terima
                          </button>
                          <button onClick={() => handleUpdateOfferStatus(offer.id, 'Ditolak')}
                            style={{ padding: '8px 14px', backgroundColor: '#FF4D4F', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                            ❌ Tolak
                          </button>
                        </div>
                      ) : (
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 700,
                          backgroundColor: offer.status === 'Diterima' ? '#E8F5E9' : '#FFEBEE',
                          color: offer.status === 'Diterima' ? '#4CAF50' : '#FF4D4F'
                        }}>
                          {offer.status === 'Diterima' ? '✅ Diterima' : '❌ Ditolak'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEEEEE' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>💬 Chat Customer</h2>
            </div>
            {loadingChat ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#7C3AED' }}>Memuat chat...</div>
            ) : manualSessions.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                <p>Belum ada chat customer yang eskalasi ke penjual.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: '450px', borderTop: '1px solid #EEEEEE' }}>
                {/* Kolom Kiri: Daftar Session */}
                <div style={{ borderRight: '1px solid #EEEEEE', overflowY: 'auto', maxHeight: '500px' }}>
                  {manualSessions.map(sid => {
                    const sessionMsgs = allMessages.filter(m => m.session_id === sid).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    const lastMsg = sessionMsgs[sessionMsgs.length - 1]
                    const isSelected = selectedSession === sid
                    return (
                      <div key={sid} onClick={() => setSelectedSession(sid)}
                        style={{ padding: '16px', borderBottom: '1px solid #F5F5F5', cursor: 'pointer', backgroundColor: isSelected ? '#F5F3FF' : 'white', transition: 'background 0.2s' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? '#7C3AED' : '#333' }}>
                          Customer ({sid.slice(0, 12)}...)
                        </div>
                        {lastMsg && (
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lastMsg.sender}: {lastMsg.text}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Kolom Kanan: Chat Window */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
                  {selectedSession ? (
                    <>
                      <div style={{ padding: '15px 20px', borderBottom: '1px solid #EEEEEE', backgroundColor: '#F9F8FF', fontWeight: 600, fontSize: '14px' }}>
                        Chat dengan Customer ({selectedSession})
                      </div>
                      <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#F9F9F9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {allMessages
                          .filter(m => m.session_id === selectedSession)
                          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                          .map(msg => (
                            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'Customer' ? 'flex-end' : 'flex-start' }}>
                              <div style={{ maxWidth: '70%' }}>
                                <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px', textAlign: msg.sender === 'Customer' ? 'right' : 'left' }}>
                                  {msg.sender}
                                </div>
                                <div style={{
                                  padding: '10px 14px',
                                  borderRadius: '12px',
                                  fontSize: '13px',
                                  backgroundColor: msg.sender === 'Customer' ? '#7C3AED' : 'white',
                                  color: msg.sender === 'Customer' ? 'white' : '#333',
                                  border: msg.sender !== 'Customer' ? '1px solid #EEEEEE' : 'none',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>
                                  {msg.text}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                      <div style={{ display: 'flex', padding: '12px', borderTop: '1px solid #EEEEEE', backgroundColor: 'white' }}>
                        <input
                          type="text"
                          placeholder="Ketik balasan ke customer..."
                          value={adminInput}
                          onChange={(e) => setAdminInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAdminReply()}
                          style={{ flexGrow: 1, border: '1px solid #EEEEEE', borderRadius: '8px', padding: '10px 14px', outline: 'none', fontFamily: 'inherit', fontSize: '14px' }}
                        />
                        <button onClick={handleAdminReply}
                          style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                          Kirim
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '14px' }}>
                      👈 Pilih percakapan customer di samping untuk mulai membalas
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Form Modal */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEEEEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{editId ? '✏️ Edit Produk' : '➕ Tambah Produk'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#999' }}>×</button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Upload Foto */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '8px' }}>Foto Produk</label>
                <div style={{ border: '2px dashed #C4B5FD', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#FAF5FF', position: 'relative' }}
                  onClick={() => document.getElementById('imageInput')?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', margin: '0 auto', display: 'block' }} />
                  ) : (
                    <div>
                      <div style={{ fontSize: '36px', marginBottom: '8px' }}>📸</div>
                      <p style={{ color: '#7C3AED', fontWeight: 600, fontSize: '14px', margin: 0 }}>Klik untuk upload foto</p>
                      <p style={{ color: '#999', fontSize: '12px', margin: '4px 0 0' }}>JPG, PNG, WebP (maks 5MB)</p>
                    </div>
                  )}
                  <input id="imageInput" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </div>
                {imagePreview && (
                  <button onClick={() => { setImagePreview(''); setImageFile(null); setForm(p => ({ ...p, image_url: '' })) }}
                    style={{ marginTop: '8px', background: 'none', border: 'none', color: '#FF4D4F', cursor: 'pointer', fontSize: '13px' }}>
                    × Hapus foto
                  </button>
                )}
              </div>

              {/* Nama */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '6px' }}>Nama Produk *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="contoh: Vintage Denim Jacket"
                  style={{ width: '100%', padding: '12px', border: '1px solid #EEEEEE', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>

              {/* Harga */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '6px' }}>Harga *</label>
                <input value={form.price} onChange={e => handlePriceChange(e.target.value)}
                  placeholder="contoh: 250000"
                  style={{ width: '100%', padding: '12px', border: '1px solid #EEEEEE', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>

              {/* Kondisi & Stok */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '6px' }}>Kondisi</label>
                  <select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}
                    style={{ width: '100%', padding: '12px', border: '1px solid #EEEEEE', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', fontSize: '14px', backgroundColor: 'white' }}>
                    <option>Good</option>
                    <option>Very Good</option>
                    <option>Like New</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '6px' }}>Stok</label>
                  <input type="number" min="0" value={form.stok} onChange={e => setForm(p => ({ ...p, stok: parseInt(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '12px', border: '1px solid #EEEEEE', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '8px' }}>Kategori</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {categoryOptions.map(cat => (
                    <button key={cat} onClick={() => toggleCategory(cat)}
                      style={{ padding: '8px 16px', borderRadius: '20px', border: '1.5px solid', borderColor: form.category.includes(cat) ? '#7C3AED' : '#EEEEEE', backgroundColor: form.category.includes(cat) ? '#7C3AED' : 'white', color: form.category.includes(cat) ? 'white' : '#666', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '6px' }}>Rating: {form.rating}</label>
                <input type="range" min="1" max="5" step="0.5" value={form.rating}
                  onChange={e => setForm(p => ({ ...p, rating: parseFloat(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#7C3AED' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: '12px', border: '1.5px solid #EEEEEE', borderRadius: '8px', background: 'white', color: '#666', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                  Batal
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ flex: 2, padding: '12px', border: 'none', borderRadius: '8px', background: saving ? '#C4B5FD' : '#7C3AED', color: 'white', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                  {saving ? 'Menyimpan...' : editId ? '💾 Simpan Perubahan' : '➕ Tambah Produk'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: toast ? '30px' : '-80px', left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', padding: '12px 24px', borderRadius: '30px', transition: 'bottom 0.3s', zIndex: 2000, fontWeight: 500, fontSize: '14px', whiteSpace: 'nowrap' }}>
        {toast}
      </div>
    </div>
  )
}
