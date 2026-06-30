import { supabase } from './supabase'

export async function createOffer(offer: {
  product_id: number
  product_name: string
  offer_price: number
  customer_name: string
}) {
  const { data, error } = await supabase
    .from('offers')
    .insert([{ ...offer, status: 'Pending' }])
    .select()
  if (error) throw error
  return data
}

export async function getOffers() {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateOfferStatus(id: number, status: string) {
  const { error } = await supabase
    .from('offers')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}
