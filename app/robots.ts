import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/i18n-path'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/api/', '/auth/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
