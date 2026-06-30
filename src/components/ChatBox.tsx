"use client"
import { useState, useEffect, useRef } from 'react'
import { getMessages, sendMessage, subscribeMessages } from '@/lib/messages'
import { getBotReply } from '@/lib/chatbot'

interface Props {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: number
  sender: string
  text: string
  mode: string
  created_at: string
}

export default function ChatBox({ isOpen, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [chatMode, setChatMode] = useState<'bot' | 'manual'>('bot')
  const [sessionId, setSessionId] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    let sid = localStorage.getItem('thriftin_session_id')
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
      localStorage.setItem('thriftin_session_id', sid)
    }
    setSessionId(sid)

    async function load() {
      try {
        const data = await getMessages(sid!)
        setMessages(data || [])
        const lastManual = data?.filter(m => m.mode === 'manual')
        if (lastManual && lastManual.length > 0) setChatMode('manual')
      } catch { }
      setLoading(false)
    }
    load()

    const channel = subscribeMessages(sid, (newMsg) => {
      setMessages(prev => [...prev, newMsg])
    })

    return () => { channel.unsubscribe() }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || !sessionId) return
    const text = input
    setInput('')

    try {
      await sendMessage('Customer', text, sessionId, chatMode)

      if (chatMode === 'bot') {
        setTimeout(async () => {
          const reply = getBotReply(text)
          await sendMessage('Bot', reply, sessionId, 'bot')
        }, 800)
      }
      // Kalau mode manual, tidak ada auto-reply, nunggu admin balas dari Admin Panel
    } catch { }
  }

  async function handleEskalasiAdmin() {
    setChatMode('manual')
    try {
      await sendMessage('System', '🔔 Customer ingin chat langsung dengan penjual', sessionId, 'manual')
      setTimeout(async () => {
        await sendMessage('Penjual', 'Halo, saya penjual ThriftIn. Ada yang bisa saya bantu? 😊', sessionId, 'manual')
      }, 1000)
    } catch { }
  }

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', bottom: '90px', right: '30px', width: '320px', background: 'white', borderRadius: '12px', boxShadow: '0 5px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 95, overflow: 'hidden' }}>
      <div style={{ background: '#7C3AED', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>
            {chatMode === 'bot' ? '🤖 ThriftIn Assistant' : '💬 Chat Penjual'}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>
            {chatMode === 'bot' ? 'Bot otomatis' : '🟢 Terhubung dengan penjual'}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' }}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div style={{ height: '300px', padding: '15px', overflowY: 'auto', background: '#F9F9F9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <p style={{ fontSize: '13px', color: '#999', textAlign: 'center' }}>Memuat chat...</p>
        ) : messages.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginTop: '10px' }}>Halo! Saya asisten ThriftIn 🤖<br/>Tanya apa saja tentang produk, pembayaran, atau pengiriman!</p>
        ) : (
          messages.map(msg => {
            if (msg.sender === 'System') {
              return (
                <div key={msg.id} style={{ textAlign: 'center', fontSize: '11px', color: '#999', padding: '4px 0' }}>
                  {msg.text}
                </div>
              )
            }
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'Customer' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '75%' }}>
                  {msg.sender !== 'Customer' && (
                    <div style={{ fontSize: '10px', color: '#999', marginBottom: '2px', marginLeft: '4px' }}>
                      {msg.sender === 'Bot' ? '🤖 Bot' : '👤 Penjual'}
                    </div>
                  )}
                  <div style={{
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
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {chatMode === 'bot' && (
        <div style={{ padding: '10px 15px', borderTop: '1px solid #EEEEEE', backgroundColor: '#FAF5FF' }}>
          <button onClick={handleEskalasiAdmin}
            style={{ width: '100%', padding: '8px', backgroundColor: 'white', border: '1.5px solid #7C3AED', color: '#7C3AED', borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
            👤 Chat dengan Penjual Langsung
          </button>
        </div>
      )}

      <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #EEEEEE' }}>
        <input
          type="text"
          placeholder={chatMode === 'bot' ? 'Tanya sesuatu...' : 'Tulis pesan ke penjual...'}
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
