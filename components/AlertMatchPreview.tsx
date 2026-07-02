'use client'

import { useEffect, useState } from 'react'
import { Loader2, Home, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { alertToDormsHref, countMatches, type UIMatchCriteria } from '@/lib/alertMatch'
import type { Dorm } from '@/lib/helpers'
import { Link } from '@/i18n/navigation'

export default function AlertMatchPreview({ criteria }: { criteria: UIMatchCriteria }) {
  const t = useTranslations('alertMatch')
  const [dorms, setDorms] = useState<Dorm[] | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('dorms')
      .select('*')
      .eq('active', true)
      .then(({ data }) => setDorms((data ?? []) as Dorm[]))
  }, [])

  if (dorms === null) {
    return (
      <div className="card-elevated flex items-center gap-2 rounded-2xl bg-surface p-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {t('checking')}
      </div>
    )
  }

  const count = countMatches(dorms, criteria)
  const href = alertToDormsHref(criteria)

  return (
    <div className="card-elevated flex items-center gap-3 rounded-2xl bg-surface p-4 sm:p-5">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white">
        <Home className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {count === 1
            ? t('matchCount', { count })
            : t('matchCountPlural', { count })}
        </p>
        <p className="text-xs text-muted-foreground">{t('hint')}</p>
      </div>
      {count > 0 && (
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-1 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand-soft/70 sm:inline-flex"
        >
          {t('view')}
          <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  )
}
