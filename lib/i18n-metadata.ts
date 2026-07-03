import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { absoluteUrl, localePath } from '@/lib/i18n-path'

/** og:locale expects an underscore-separated language_TERRITORY token. */
const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  de: 'de_AT',
  ru: 'ru_RU',
}

export function buildLanguageAlternates(internalPath: string): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const locale of routing.locales) {
    languages[locale] = absoluteUrl(localePath(internalPath, locale))
  }
  languages['x-default'] = absoluteUrl(localePath(internalPath, routing.defaultLocale))
  return languages
}

export function buildPageMetadata(
  locale: string,
  internalPath: string,
  title: string,
  description?: string,
): Metadata {
  const canonical = absoluteUrl(localePath(internalPath, locale))
  return {
    title,
    ...(description ? { description } : {}),
    alternates: {
      canonical,
      languages: buildLanguageAlternates(internalPath),
    },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      url: canonical,
      siteName: 'Dormra',
      locale: OG_LOCALE[locale] ?? locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description ? { description } : {}),
    },
  }
}
