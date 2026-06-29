"use client"
import { useThrift } from '@/context/ThriftContext'

const filters = ['Semua', 'Wanita', 'Pria', 'Aksesoris', 'Merek', 'Harga']

export default function FilterBar() {
  const { activeFilter, setActiveFilter } = useThrift()

  return (
    <div className="filter-bar" style={{ margin: '30px 0', display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setActiveFilter(filter)}
          style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: activeFilter === filter ? '1px solid #C9B8F0' : '1px solid #EEEEEE',
            backgroundColor: activeFilter === filter ? '#C9B8F0' : 'white',
            color: activeFilter === filter ? 'white' : '#666',
            fontSize: '14px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >{filter}</button>
      ))}
    </div>
  )
}
