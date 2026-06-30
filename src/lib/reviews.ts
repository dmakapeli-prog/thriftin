import { supabase } from './supabase'

export async function getProductReviews(productId: number) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getReviewableOrders(customerName: string) {
  const { data: orders, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .ilike('customer_name', `%${customerName}%`)
    .in('status', ['Selesai', 'Dikirim'])
  if (orderErr) throw orderErr

  const { data: existingReviews, error: reviewErr } = await supabase
    .from('reviews')
    .select('order_id, product_id')
    .ilike('customer_name', `%${customerName}%`)
  if (reviewErr) throw reviewErr

  const reviewedSet = new Set(existingReviews?.map(r => `${r.order_id}-${r.product_id}`))

  const reviewableItems: any[] = []
  orders?.forEach(order => {
    order.items?.forEach((item: any) => {
      const key = `${order.id}-${item.id}`
      if (!reviewedSet.has(key)) {
        reviewableItems.push({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          order_date: order.created_at
        })
      }
    })
  })
  return reviewableItems
}

export async function createReview(review: {
  product_id: number
  order_id: number
  customer_name: string
  rating: number
  comment: string
  photo_url?: string
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
  if (error) throw error
  return data
}

export async function uploadReviewPhoto(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
  const { error } = await supabase.storage
    .from('review-photos')
    .upload(fileName, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage
    .from('review-photos')
    .getPublicUrl(fileName)
  return data.publicUrl
}

export async function getProductAvgRating(productId: number): Promise<{ avg: number, count: number }> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
  if (error || !data || data.length === 0) return { avg: 0, count: 0 }
  const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
  return { avg: Math.round(avg * 10) / 10, count: data.length }
}
