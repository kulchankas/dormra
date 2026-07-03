'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { BookmarkCheck } from 'lucide-react'
import TrackerStatusSelect from '@/components/TrackerStatusSelect'
import SaveDormButton from '@/components/SaveDormButton'
import type { TrackerStatus } from '@/lib/tracker'

export default function DormTrackerPanel({
  dormId,
  dormName,
  provider,
  isSaved,
  trackerId,
  trackerStatus,
}: {
  dormId: string
  dormName: string
  provider: string
  isSaved: boolean
  trackerId: string | null
  trackerStatus: TrackerStatus | null
}) {
  const t = useTranslations('dormDetail')

  return (
    <div className="card-elevated rounded-2xl bg-surface p-5 mb-6">
      <h2 className="text-sm font-medium text-foreground mb-1">{t('trackApplication')}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground mb-4">{t('applyNote', { provider })}</p>
      {isSaved && trackerId && trackerStatus ? (
        <div className="flex flex-wrap items-center gap-3">
          <TrackerStatusSelect trackerId={trackerId} status={trackerStatus} />
          <Link
            href="/dashboard/saved"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
          >
            <BookmarkCheck className="size-3.5" aria-hidden="true" />
            {t('viewSaved')}
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <SaveDormButton dormId={dormId} dormName={dormName} initialSaved={false} />
          <p className="text-xs text-muted-foreground">{t('saveToTrackHint')}</p>
        </div>
      )}
    </div>
  )
}
