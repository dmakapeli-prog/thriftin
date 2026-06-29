"use client"
import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImage } from '@/lib/products'

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

  useEffect(() => { loadProducts() }, [])

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

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

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
