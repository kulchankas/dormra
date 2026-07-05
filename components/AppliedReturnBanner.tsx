'use client'

import { useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

const RETURN_WINDOW_MS = 30 * 60 * 1000

function readApplyReturnFlag(dormSlug: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = sessionStorage.getItem(`dormra-applied-${dormSlug}`)
    if (!raw) return false
    const clickedAt = Number(raw)
    sessionStorage.removeItem(`dormra-applied-${dormSlug}`)
    if (Number.isNaN(clickedAt) || Date.now() - clickedAt > RETURN_WINDOW_MS) return false
    return true
  } catch {
    return false
  }
}

export default function AppliedReturnBanner({
  dormSlug,
  dormName,
  provider,
  isLoggedIn,
  isSaved,
  trackerStatus,
}: {
  dormSlug: string
  dormName: string
  provider: string
  isLoggedIn: boolean
  isSaved: boolean
  trackerStatus: string | null
}) {
  const t = useTranslations('dormDetail')
  const [visible, setVisible] = useState(() => isLoggedIn && readApplyReturnFlag(dormSlug))

  if (!visible) return null

  const alreadyApplied = isSaved && (trackerStatus === 'applied' || trackerStatus === 'accepted')

  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-soft px-4 py-3"
    >
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          {alreadyApplied ? t('returnBannerApplied', { name: dormName }) : t('returnBannerPrompt', { provider })}
        </p>
        {!alreadyApplied && (
          <p className="mt-0.5 text-xs text-muted-foreground">{t('returnBannerHint')}</p>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="size-8 shrink-0 p-0"
        onClick={() => setVisible(false)}
        aria-label={t('returnBannerDismiss')}
      >
        <X className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
