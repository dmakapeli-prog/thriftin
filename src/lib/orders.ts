import { supabase } from './supabase'

export async function createOrder(order: {
  customer_name: string
  customer_address: string
  payment_method: string
  total: number
  items: any[]
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert([{ ...order, status: 'Pending' }])
    .select()
  if (error) throw error
  return data
}

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateOrderStatus(id: number, status: string) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}
