import en from '@/messages/en.json'
import de from '@/messages/de.json'
import ru from '@/messages/ru.json'
import { routing, type Locale } from '@/i18n/routing'

const bundles = { en, de, ru } as const

export type EmailMessages = (typeof en)['email']

export function resolveLocale(locale: string | null | undefined): Locale {
  if (locale && routing.locales.includes(locale as Locale)) {
    return locale as Locale
  }
  return routing.defaultLocale
}

export function getEmailMessages(locale: string | null | undefined): EmailMessages {
  const code = resolveLocale(locale)
  return bundles[code].email
}
