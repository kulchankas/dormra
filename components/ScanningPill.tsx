'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { de, ru, enGB } from 'date-fns/locale'
import { DISTRICT_NAMES } from '@/lib/helpers'

const DISTRICTS = Object.values(DISTRICT_NAMES)
const DATE_LOCALES = { en: enGB, de, ru } as const

interface Props {
  lastScrapedAt?: string | null
}

export default function ScanningPill({ lastScrapedAt }: Props) {
  const t = useTranslations('scanning')
  const locale = useLocale() as keyof typeof DATE_LOCALES
  const dateLocale = DATE_LOCALES[locale] ?? enGB
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % DISTRICTS.length)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  const lastChecked =
    lastScrapedAt != null
      ? formatDistanceToNow(new Date(lastScrapedAt), { addSuffix: true, locale: dateLocale })
      : null

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/80 px-3.5 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      {t('prefix')}{' '}
      <span
        key={index}
        className="font-medium text-foreground animate-in fade-in slide-in-from-bottom-1 duration-300"
      >
        {DISTRICTS[index]}
      </span>{' '}
      {t('suffix')}
      {lastChecked != null && (
        <>
          {' · '}
          <span className="text-muted-foreground/80">{t('lastChecked', { time: lastChecked })}</span>
        </>
      )}
    </span>
  )
}
