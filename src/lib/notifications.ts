import { supabase } from './supabase'

function getSessionId(): string {
  let sid = localStorage.getItem('thriftin_session_id')
  if (!sid) {
    sid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
    localStorage.setItem('thriftin_session_id', sid)
  }
  return sid
}

export async function getNotifications() {
  const sid = getSessionId()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('session_id', sid)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function markNotifAsRead(id: number) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
  if (error) throw error
}

export async function markAllNotifsAsRead() {
  const sid = getSessionId()
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('session_id', sid)
  if (error) throw error
}

export async function createNotification(sessionId: string, title: string, message: string, type: string = 'info') {
  const { error } = await supabase
    .from('notifications')
    .insert([{ session_id: sessionId, title, message, type }])
  if (error) throw error
}

export function subscribeNotifications(callback: (notif: any) => void) {
  const sid = getSessionId()
  return supabase
    .channel(`notifs-${sid}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `session_id=eq.${sid}`
    }, payload => callback(payload.new))
    .subscribe()
}
