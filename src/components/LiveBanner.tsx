"use client"
import { useState } from 'react'

export default function LiveBanner() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <section style={{ backgroundColor: '#EDE9FE', borderRadius: '12px', padding: '15px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #7C3AED', flexShrink: 0 }}>
            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" alt="Seller" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <i className="fas fa-play" style={{ fontSize: '12px' }}></i>
            </div>
          </div>
          <div>
            <div style={{ backgroundColor: '#FF4D4F', color: 'white', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
              <span className="pulse"></span> LIVE Sekarang
            </div>
            <h3 style={{ fontSize: '16px', marginBottom: '2px', color: '#333' }}>Thrift Haul: Vintage Collection</h3>
            <p style={{ fontSize: '12px', color: '#FF4D4F', fontWeight: 600 }}><i className="fas fa-eye"></i> 1.2K Menonton</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: '#7C3AED', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '25px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 10px rgba(124,58,237,0.4)' }}
        >Tonton Live</button>
      </section>

      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', borderRadius: '16px', overflow: 'hidden', background: '#000', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'white', fontSize: '24px', zIndex: 10, cursor: 'pointer' }}>
              <i className="fas fa-times"></i>
            </button>
            <div style={{ height: '400px', backgroundImage: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: '#FF4D4F', color: 'white', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span className="pulse"></span> LIVE
              </div>
              <div style={{ position: 'absolute', bottom: '20px', left: 0, width: '100%', textAlign: 'center', color: 'white' }}>
                <h3>Thrift Haul: Vintage Collection</h3>
                <p style={{ opacity: 0.8 }}>Sedang berlangsung...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
