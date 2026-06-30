import { supabase } from './supabase'

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createProduct(product: {
  name: string
  price: string
  raw_price: number
  image_url: string
  condition: string
  rating: number
  category: string[]
  stok: number
  product_type: string
}) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
  if (error) throw error
  return data
}

export async function updateProduct(id: number, product: {
  name?: string
  price?: string
  raw_price?: number
  image_url?: string
  condition?: string
  rating?: number
  category?: string[]
  stok?: number
  product_type?: string
}) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
  if (error) throw error
  return data
}

export async function deleteProduct(id: number) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function uploadImage(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)
  return data.publicUrl
}
