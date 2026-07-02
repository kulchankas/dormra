import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

type DbClient = SupabaseClient<Database>

/** Additional gallery photos for a dorm's detail page (dorms.image_url is
 * the separate single card/hero thumbnail). Returns [] gracefully if the
 * dorm has no gallery rows — callers should fall back to image_url alone. */
export async function getDormGallery(dormId: string, db: DbClient): Promise<string[]> {
  const { data, error } = await db
    .from('dorm_images')
    .select('url')
    .eq('dorm_id', dormId)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data.map((row) => row.url)
}
