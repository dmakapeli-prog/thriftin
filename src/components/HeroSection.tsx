export default function HeroSection() {
  return (
    <header style={{
      backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white',
      textAlign: 'center',
      padding: '100px 20px',
      borderRadius: '16px',
      marginTop: '20px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ fontSize: '40px', marginBottom: '15px', fontWeight: 700 }}>Thrift Smart, Live Sustainable</h1>
      <p style={{ fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>Temukan fashion preloved berkualitas dengan harga terjangkau</p>
      <button style={{
        backgroundColor: '#C9B8F0',
        color: 'white',
        border: 'none',
        padding: '12px 30px',
        borderRadius: '25px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(201,184,240,0.5)'
      }}>Mulai Belanja</button>
    </header>
  )
}
