export default function PaymentSection() {
  const payments = [
    { name: 'GoPay', color: '#00AEEF', italic: true },
    { name: 'OVO', color: '#4C3494', italic: false },
    { name: 'DANA', color: '#108EE9', italic: false },
    { name: 'ShopeePay', color: '#EE4D2D', italic: false },
    { name: 'BCA', color: '#005EAA', italic: false },
    { name: 'Mandiri', color: '#0B4A99', italic: false },
  ]

  return (
    <section style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', marginBottom: '50px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '16px', color: '#666' }}>Payment</h3>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '30px' }}>
        {payments.map((p) => (
          <div key={p.name} style={{ fontWeight: 900, color: p.color, fontSize: '20px', fontStyle: p.italic ? 'italic' : 'normal' }}>{p.name}</div>
        ))}
      </div>
    </section>
  )
}
