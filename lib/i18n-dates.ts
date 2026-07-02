const LOCALE_MAP: Record<string, string> = {
  en: 'en-GB',
  de: 'de-AT',
  ru: 'ru-RU',
}

export function dateLocale(locale: string): string {
  return LOCALE_MAP[locale] ?? 'en-GB'
}
