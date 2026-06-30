import { supabase } from './supabase'

export async function getMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function sendMessage(sender: string, text: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender, text }])
    .select()
  if (error) throw error
  return data
}

export function subscribeMessages(callback: (msg: any) => void) {
  return supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    }, payload => callback(payload.new))
    .subscribe()
}
