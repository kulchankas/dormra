import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL, localePath } from '@/lib/i18n-path'
import { routing } from '@/i18n/routing'

const STATIC_PATHS = ['/', '/dorms', '/how-it-works', '/privacy', '/terms'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: dorms } = await supabase
    .from('dorms')
    .select('slug, created_at')
    .eq('active', true)

  const entries: MetadataRoute.Sitemap = []
  const now = new Date()

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${SITE_URL}${localePath(path, locale)}`,
        lastModified: now,
        changeFrequency: path === '/' ? 'daily' : 'weekly',
        priority: path === '/' ? 1 : 0.8,
      })
    }

    for (const dorm of dorms ?? []) {
      entries.push({
        url: `${SITE_URL}${localePath(`/dorms/${dorm.slug}`, locale)}`,
        lastModified: dorm.created_at ? new Date(dorm.created_at) : now,
        changeFrequency: 'daily',
        priority: 0.7,
      })
    }
  }

  return entries
}
