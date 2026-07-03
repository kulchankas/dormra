'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import StarRating from '@/components/StarRating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Chip } from '@/components/ui/toggle-chip'
import { createReview, updateReview } from '@/app/[locale]/dorms/[slug]/review-actions'
import { REVIEW_BODY_MAX_LENGTH, REVIEW_BODY_MIN_LENGTH } from '@/lib/dorm-reviews'
import { REVIEW_TAGS, MAX_TAGS_PER_REVIEW, type ReviewTag } from '@/lib/review-tags'
import { reviewTagLabel } from '@/lib/review-tag-labels'

type Props = {
  dormId: string
  dormSlug: string
  mode: 'create' | 'edit'
  reviewId?: string
  initialRating?: number
  initialBody?: string
  initialTags?: ReviewTag[]
  onDone?: () => void
  onCancel?: () => void
}

export default function DormReviewForm({
  dormId,
  dormSlug,
  mode,
  reviewId,
  initialRating = 0,
  initialBody = '',
  initialTags = [],
  onDone,
  onCancel,
}: Props) {
  const t = useTranslations('reviews')
  const router = useRouter()
  const [rating, setRating] = useState(initialRating)
  const [body, setBody] = useState(initialBody)
  const [tags, setTags] = useState<ReviewTag[]>(initialTags)
  const [isPending, startTransition] = useTransition()

  const bodyLength = body.trim().length
  const canSubmit = rating > 0 && bodyLength >= REVIEW_BODY_MIN_LENGTH && bodyLength <= REVIEW_BODY_MAX_LENGTH

  function toggleTag(tag: ReviewTag) {
    setTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag)
      if (prev.length >= MAX_TAGS_PER_REVIEW) return prev
      return [...prev, tag]
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createReview(dormSlug, dormId, { rating, body, tags })
          : await updateReview(dormSlug, reviewId!, { rating, body, tags })

      if (result.error === 'already_reviewed') {
        toast.error(t('alreadyReviewed'))
        return
      }
      if (result.error) {
        toast.error(t('submitError'))
        return
      }

      toast.success(mode === 'create' ? t('postedToast') : t('updatedToast'))
      if (mode === 'create') {
        setRating(0)
        setBody('')
        setTags([])
      }
      router.refresh()
      onDone?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card-elevated rounded-2xl bg-surface p-4">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{t('yourRating')}</p>
      <StarRating value={rating} onChange={setRating} size="lg" starLabel={(n) => t('starLabel', { n })} />

      <p className="mb-1.5 mt-3 text-xs font-medium text-muted-foreground">{t('tagsLabel')}</p>
      <div className="flex flex-wrap gap-1.5">
        {REVIEW_TAGS.map((tag) => (
          <Chip key={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)}>
            {reviewTagLabel(t, tag)}
          </Chip>
        ))}
      </div>

      <label htmlFor="review-body" className="sr-only">
        {t('bodyLabel')}
      </label>
      <Textarea
        id="review-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t('bodyPlaceholder')}
        maxLength={REVIEW_BODY_MAX_LENGTH}
        rows={4}
        className="mt-3"
      />
      <div className="mt-1 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">{t('anonymityHint')}</p>
        <p className="text-[11px] text-muted-foreground">
          {bodyLength}/{REVIEW_BODY_MAX_LENGTH}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button type="submit" size="sm" className="rounded-full" disabled={!canSubmit || isPending}>
          {isPending ? t('submitting') : mode === 'create' ? t('postReview') : t('saveChanges')}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={onCancel} disabled={isPending}>
            {t('cancel')}
          </Button>
        )}
      </div>
    </form>
  )
}
