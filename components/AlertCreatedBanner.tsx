'use client'

import { CheckCircle2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export default function AlertCreatedBanner({
  availableMatches,
  criteriaMatches,
  dormsHref,
}: {
  availableMatches: number
  criteriaMatches: number
  dormsHref: string
}) {
  const t = useTranslations('dashboard')
  const router = useRouter()

  function dismiss() {
    router.replace('/dashboard/alerts')
  }

  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand/20 bg-brand-soft/60 p-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="flex gap-3">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-foreground">{t('alertCreatedTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {availableMatches > 0
              ? t('alertCreatedWithAvailable', { count: availableMatches })
              : criteriaMatches > 0
                ? t('alertCreatedWithMatches', { count: criteriaMatches })
                : t('alertCreatedNoMatches')}
          </p>
          {(availableMatches > 0 || criteriaMatches > 0) && (
            <Button
              variant="link"
              size="sm"
              nativeButton={false}
              className="mt-2 h-auto p-0 text-brand"
              render={<Link href={dormsHref} />}
            >
              {t('viewMatchingDorms')}
            </Button>
          )}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-8 shrink-0 self-end sm:self-start"
        onClick={dismiss}
        aria-label={t('dismissBanner')}
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}
