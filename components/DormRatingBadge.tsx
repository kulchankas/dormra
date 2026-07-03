import { useTranslations } from 'next-intl'
import StarRating from '@/components/StarRating'
import { type DormRatingSummary } from '@/lib/dorm-reviews'
import { cn } from '@/lib/utils'

export default function DormRatingBadge({
  summary,
  size = 'sm',
  className,
}: {
  summary: DormRatingSummary
  size?: 'sm' | 'md'
  className?: string
}) {
  const t = useTranslations('reviews')

  if (summary.count === 0) {
    return (
      <span className={cn('text-xs text-muted-foreground', className)}>{t('noReviewsYet')}</span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <StarRating value={summary.average ?? 0} size={size === 'md' ? 'md' : 'sm'} />
      <span className={cn('font-medium text-foreground', size === 'md' ? 'text-sm' : 'text-xs')}>
        {summary.average!.toFixed(1)}
      </span>
      <span className="text-xs text-muted-foreground">
        {summary.count === 1 ? t('reviewCount', { count: summary.count }) : t('reviewCountPlural', { count: summary.count })}
      </span>
    </span>
  )
}
