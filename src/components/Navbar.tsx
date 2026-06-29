"use client"
import { useThrift } from '@/context/ThriftContext'

export default function Navbar() {
  const { cartCount, searchQuery, setSearchQuery } = useThrift()

  return (
    <nav style={{ backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        <a href="#" style={{ fontSize: '24px', fontWeight: 700, color: '#7C3AED', textDecoration: 'none' }}>ThriftIn</a>
        <div style={{ flexGrow: 1, maxWidth: '500px', margin: '0 20px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Cari pakaian preloved..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 20px', paddingRight: '40px', border: '1px solid #EEEEEE', borderRadius: '20px', outline: 'none', backgroundColor: '#F5F5F5', fontFamily: 'inherit', fontSize: '14px' }}
          />
          <i className="fas fa-search" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}></i>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button style={{ background: 'none', border: 'none', fontSize: '20px', color: '#333', position: 'relative', cursor: 'pointer' }}>
            <i className="fas fa-shopping-cart"></i>
            <span style={{ position: 'absolute', top: '-5px', right: '-8px', backgroundColor: '#FF4D4F', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' }}>{cartCount}</span>
          </button>
          <button style={{ background: 'none', border: 'none', fontSize: '20px', color: '#333', position: 'relative', cursor: 'pointer' }}>
            <i className="fas fa-bell"></i>
            <span style={{ position: 'absolute', top: '-5px', right: '-8px', backgroundColor: '#FF4D4F', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px' }}>3</span>
          </button>
          <button style={{ backgroundColor: 'white', color: '#7C3AED', border: '1.5px solid #7C3AED', padding: '8px 20px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer' }}>Login</button>
        </div>
      </div>
    </nav>
  )
}
