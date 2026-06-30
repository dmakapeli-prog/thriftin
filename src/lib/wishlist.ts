import { supabase } from './supabase'

function getSessionId(): string {
  let sid = localStorage.getItem('thriftin_session_id')
  if (!sid) {
    sid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9)
    localStorage.setItem('thriftin_session_id', sid)
  }
  return sid
}

export async function getWishlist() {
  const sid = getSessionId()
  const { data, error } = await supabase
    .from('wishlist')
    .select('*')
    .eq('session_id', sid)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addToWishlist(product: { id: number, name: string, price: string, image: string }) {
  const sid = getSessionId()
  const { error } = await supabase
    .from('wishlist')
    .insert([{
      session_id: sid,
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_image: product.image
    }])
  if (error && error.code !== '23505') throw error // ignore duplicate
}

export async function removeFromWishlist(productId: number) {
  const sid = getSessionId()
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('session_id', sid)
    .eq('product_id', productId)
  if (error) throw error
}

export async function isInWishlist(productId: number): Promise<boolean> {
  const sid = getSessionId()
  const { data, error } = await supabase
    .from('wishlist')
    .select('id')
    .eq('session_id', sid)
    .eq('product_id', productId)
    .maybeSingle()
  if (error) return false
  return !!data
}
