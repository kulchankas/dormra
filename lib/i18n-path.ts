import { routing } from '@/i18n/routing'

export function localePath(path: string, locale: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (locale === routing.defaultLocale) return normalized
  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dormra.eu'

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`
}
