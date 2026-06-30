import { supabase } from './supabase'

export async function getMessages(sessionId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getAllSessions() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function sendMessage(sender: string, text: string, sessionId: string, mode: string = 'bot') {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender, text, session_id: sessionId, mode }])
    .select()
  if (error) throw error
  return data
}

export function subscribeMessages(sessionId: string, callback: (msg: any) => void) {
  return supabase
    .channel(`messages-${sessionId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `session_id=eq.${sessionId}`
    }, payload => callback(payload.new))
    .subscribe()
}
