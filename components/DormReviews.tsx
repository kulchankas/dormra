'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { de, ru, enGB } from 'date-fns/locale'
import { Pencil, Trash2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Link, useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import StarRating from '@/components/StarRating'
import DormReviewForm from '@/components/DormReviewForm'
import ReportReviewDialog from '@/components/ReportReviewDialog'
import { deleteReview } from '@/app/[locale]/dorms/[slug]/review-actions'
import type { DormReview } from '@/lib/dorm-reviews'

const DATE_LOCALES = { en: enGB, de, ru } as const

type Props = {
  dormId: string
  dormSlug: string
  reviews: DormReview[]
  isAuthenticated: boolean
}

function OwnReviewCard({ dormId, dormSlug, review }: { dormId: string; dormSlug: string; review: DormReview }) {
  const t = useTranslations('reviews')
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (editing) {
    return (
      <DormReviewForm
        dormId={dormId}
        dormSlug={dormSlug}
        mode="edit"
        reviewId={review.id}
        initialRating={review.rating}
        initialBody={review.body}
        onDone={() => setEditing(false)}
        onCancel={() => setEditing(false)}
      />
    )
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteReview(dormSlug, review.id)
      if (result.error) {
        toast.error(t('submitError'))
        return
      }
      toast.success(t('deletedToast'))
      router.refresh()
    })
  }

  return (
    <div className="card-elevated rounded-2xl bg-brand-soft/40 p-4 ring-1 ring-brand/20">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
          {t('yourReview')}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t('editReview')}
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t('deleteReview')}
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      {review.hidden && <p className="mb-1.5 text-xs text-amber-700">{t('pendingReviewNotice')}</p>}
      <StarRating value={review.rating} size="sm" ariaLabel={t('ratingAria', { rating: review.rating })} />
      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{review.body}</p>
    </div>
  )
}

function ReviewCard({ review, dateLocale }: { review: DormReview; dateLocale: (typeof DATE_LOCALES)[keyof typeof DATE_LOCALES] }) {
  const t = useTranslations('reviews')
  const timeAgo = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: dateLocale })
  const edited = review.updatedAt !== review.createdAt

  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-4">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{review.pseudonym}</span>
          <StarRating value={review.rating} size="sm" ariaLabel={t('ratingAria', { rating: review.rating })} />
        </div>
        <ReportReviewDialog reviewId={review.id} />
      </div>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{review.body}</p>
      <p className="mt-2 text-[11px] text-muted-foreground/70">
        {timeAgo}
        {edited && ` · ${t('editedTag')}`}
      </p>
    </div>
  )
}

export default function DormReviews({ dormId, dormSlug, reviews, isAuthenticated }: Props) {
  const t = useTranslations('reviews')
  const locale = useLocale()
  const dateLocale = DATE_LOCALES[locale as keyof typeof DATE_LOCALES] ?? enGB

  const ownReview = reviews.find((r) => r.isOwn)
  const otherReviews = reviews.filter((r) => !r.isOwn)

  return (
    <div className="mt-10 border-t border-border pt-8">
      <h2 className="mb-1 text-sm font-semibold text-foreground">{t('sectionTitle')}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{t('sectionSubtitle')}</p>

      <div className="space-y-3">
        {ownReview ? (
          <OwnReviewCard dormId={dormId} dormSlug={dormSlug} review={ownReview} />
        ) : isAuthenticated ? (
          <DormReviewForm dormId={dormId} dormSlug={dormSlug} mode="create" />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">{t('loginPrompt')}</p>
            <Link
              href={{ pathname: '/login', query: { redirect: `/dorms/${dormSlug}` } }}
              className="mt-2 inline-block text-sm font-medium text-brand hover:underline"
            >
              {t('loginCta')}
            </Link>
          </div>
        )}

        {otherReviews.length === 0 && !ownReview && (
          <p className="text-sm text-muted-foreground">{t('beFirst')}</p>
        )}

        {otherReviews.map((review) => (
          <ReviewCard key={review.id} review={review} dateLocale={dateLocale} />
        ))}
      </div>
    </div>
  )
}
