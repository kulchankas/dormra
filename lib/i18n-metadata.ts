import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { absoluteUrl, localePath } from '@/lib/i18n-path'

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
  }
}
