'use client'

import { useState, useTransition } from 'react'
import { Flag } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { reportReview } from '@/app/[locale]/dorms/[slug]/review-actions'
import { REPORT_REASONS, type ReportReason } from '@/lib/dorm-reviews'

export default function ReportReviewDialog({ reviewId }: { reviewId: string }) {
  const t = useTranslations('reviews')
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason>('spam')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  const reasonLabels: Record<ReportReason, string> = {
    spam: t('reasonSpam'),
    harassment: t('reasonHarassment'),
    false_info: t('reasonFalseInfo'),
    off_topic: t('reasonOffTopic'),
    other: t('reasonOther'),
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await reportReview(reviewId, reason, details || null)
      if (result.error === 'already_reported') {
        toast.info(t('alreadyReported'))
        setOpen(false)
        return
      }
      if (result.error) {
        toast.error(t('reportError'))
        return
      }
      setSubmitted(true)
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setTimeout(() => {
            setSubmitted(false)
            setDetails('')
            setReason('spam')
          }, 200)
        }
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label={t('reportAria')}
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-[11px] text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          />
        }
      >
        <Flag className="size-3" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent>
        {submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('reportThanksTitle')}</DialogTitle>
              <DialogDescription>{t('reportThanksBody')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button size="sm" />}>{t('close')}</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('reportTitle')}</DialogTitle>
              <DialogDescription>{t('reportDescription')}</DialogDescription>
            </DialogHeader>

            <fieldset className="mt-1 space-y-1.5">
              <legend className="sr-only">{t('reportTitle')}</legend>
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="size-3.5 accent-brand"
                  />
                  {reasonLabels[r]}
                </label>
              ))}
            </fieldset>

            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t('reportDetailsPlaceholder')}
              maxLength={500}
              rows={2}
              className="mt-2"
            />

            <DialogFooter>
              <DialogClose render={<Button variant="outline" size="sm" />}>{t('cancel')}</DialogClose>
              <Button size="sm" onClick={handleSubmit} disabled={isPending}>
                {isPending ? t('submitting') : t('reportSubmit')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
