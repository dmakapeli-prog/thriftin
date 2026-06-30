"use client"
import { useThrift } from '@/context/ThriftContext'

const filters = ['Semua', 'Wanita', 'Pria', 'Aksesoris', 'Merek', 'Harga']
const productTypes = ['Semua Tipe', 'Thrift', 'Preloved']

export default function FilterBar() {
  const { activeFilter, setActiveFilter, activeType, setActiveType } = useThrift()

  return (
    <div style={{ margin: '30px 0' }}>
      {/* Filter Tipe Produk */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {productTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: activeType === type ? '2px solid #7C3AED' : '2px solid #EEEEEE',
              backgroundColor: activeType === type ? '#7C3AED' : 'white',
              color: activeType === type ? 'white' : '#666',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {type === 'Thrift' && '♻️ '}{type === 'Preloved' && '✨ '}{type}
          </button>
        ))}
      </div>

      {/* Filter Kategori */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: activeFilter === filter ? '1px solid #7C3AED' : '1px solid #EEEEEE',
              backgroundColor: activeFilter === filter ? '#7C3AED' : 'white',
              color: activeFilter === filter ? 'white' : '#666',
              fontSize: '14px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.3s',
              flexShrink: 0
            }}
          >{filter}</button>
        ))}
      </div>
    </div>
  )
}
