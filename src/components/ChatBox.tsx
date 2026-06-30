"use client"
import { useState, useEffect, useRef } from 'react'
import { getMessages, sendMessage, subscribeMessages } from '@/lib/messages'

interface Props {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: number
  sender: string
  text: string
  created_at: string
}

export default function ChatBox({ isOpen, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    async function load() {
      try {
        const data = await getMessages()
        setMessages(data || [])
      } catch { }
      setLoading(false)
    }
    load()

    const channel = subscribeMessages((newMsg) => {
      setMessages(prev => [...prev, newMsg])
    })

    return () => { channel.unsubscribe() }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim()) return
    const text = input
    setInput('')
    try {
      await sendMessage('Customer', text)
      // Auto-reply simulasi penjual setelah 1.5 detik
      setTimeout(async () => {
        await sendMessage('Penjual', 'Terima kasih atas pesannya! Kami akan segera membalas. 😊')
      }, 1500)
    } catch { }
  }

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', bottom: '90px', right: '30px', width: '320px', background: 'white', borderRadius: '12px', boxShadow: '0 5px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 95, overflow: 'hidden' }}>
      <div style={{ background: '#7C3AED', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>💬 Chat Penjual</div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>🟢 Online</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' }}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div style={{ height: '300px', padding: '15px', overflowY: 'auto', background: '#F9F9F9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <p style={{ fontSize: '13px', color: '#999', textAlign: 'center' }}>Memuat chat...</p>
        ) : messages.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginTop: '10px' }}>Halo! Ada yang bisa kami bantu? 👋</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'Customer' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '13px',
                backgroundColor: msg.sender === 'Customer' ? '#7C3AED' : 'white',
                color: msg.sender === 'Customer' ? 'white' : '#333',
                boxShadow: msg.sender !== 'Customer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #EEEEEE' }}>
        <input
          type="text"
          placeholder="Tulis pesan..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{ flexGrow: 1, border: 'none', outline: 'none', padding: '8px', fontFamily: 'inherit', fontSize: '14px' }}
        />
        <button onClick={handleSend} style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: '18px', cursor: 'pointer' }}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  )
}
