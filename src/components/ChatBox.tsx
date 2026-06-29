"use client"

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ChatBox({ isOpen, onClose }: Props) {
  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', bottom: '90px', right: '30px', width: '300px', background: 'white', borderRadius: '12px', boxShadow: '0 5px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 95, overflow: 'hidden' }}>
      <div style={{ background: '#C9B8F0', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>Chat Penjual</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
      </div>
      <div style={{ height: '250px', padding: '15px', overflowY: 'auto', background: '#F9F9F9' }}>
        <p style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginTop: '10px' }}>Halo! Ada yang bisa kami bantu?</p>
      </div>
      <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #EEEEEE' }}>
        <input type="text" placeholder="Tulis pesan..." style={{ flexGrow: 1, border: 'none', outline: 'none', padding: '8px', fontFamily: 'inherit' }} />
        <button style={{ background: 'none', border: 'none', color: '#C9B8F0', fontSize: '18px', cursor: 'pointer' }}><i className="fas fa-paper-plane"></i></button>
      </div>
    </div>
  )
}
