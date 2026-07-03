'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TRACKER_STATUS_ORDER, type TrackerStatus } from '@/lib/tracker'
import { updateTrackerStatus } from '@/app/[locale]/dashboard/saved/actions'

export default function TrackerStatusSelect({
  trackerId,
  status,
}: {
  trackerId: string
  status: TrackerStatus
}) {
  const t = useTranslations('saved')
  const router = useRouter()
  const [optimistic, setOptimistic] = useState<TrackerStatus>(status)
  const [isPending, startTransition] = useTransition()

  const statusLabels: Record<TrackerStatus, string> = {
    interested: t('statusInterested'),
    applied: t('statusApplied'),
    accepted: t('statusAccepted'),
    rejected: t('statusRejected'),
  }

  function handleChange(next: TrackerStatus | null) {
    if (!next) return
    const nextStatus = next
    const prev = optimistic
    setOptimistic(nextStatus)
    startTransition(async () => {
      const result = await updateTrackerStatus(trackerId, nextStatus)
      if (result.error) {
        setOptimistic(prev)
        toast.error(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <Select value={optimistic} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="h-8 rounded-full text-xs" aria-label={t('statusLabel')}>
        <SelectValue>{(value: unknown) => statusLabels[value as TrackerStatus]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TRACKER_STATUS_ORDER.map((s) => (
          <SelectItem key={s} value={s}>
            {statusLabels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
