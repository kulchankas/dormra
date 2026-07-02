'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Home } from 'lucide-react'
import DormImage from '@/components/DormImage'
import {
  formatDistrictLabel,
  formatPriceLabel,
  getChancesRating,
  type AvailabilityStatus,
  type Dorm,
} from '@/lib/helpers'
import AvailabilityBadge from '@/components/AvailabilityBadge'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type Variant = 'compact' | 'full'

interface Props {
  dorm: Dorm
  availability: AvailabilityStatus
  variant?: Variant
}

export default function DormCard({ dorm, availability, variant = 'full' }: Props) {
  const t = useTranslations('dormCard')
  const tChances = useTranslations('chances')
  const chances = getChancesRating(dorm.provider, (key) => tChances(key))
  const districtLabel = formatDistrictLabel(dorm.district)
  const priceLabel = formatPriceLabel(dorm.price_min, dorm.price_max)
  const isCompact = variant === 'compact'

  const depositLabel = dorm.deposit_months
    ? dorm.deposit_months === 1
      ? t('depositMonths', { count: dorm.deposit_months })
      : t('depositMonthsPlural', { count: dorm.deposit_months })
    : dorm.deposit_eur
      ? t('depositEur', { amount: dorm.deposit_eur })
      : null

  const amenities = [
    dorm.pets === true && t('pets'),
    dorm.couples === true && t('couples'),
    dorm.furnished === true && t('furnished'),
  ].filter((x): x is string => typeof x === 'string')

  return (
    <Link
      href={`/dorms/${dorm.slug}`}
      aria-label={t('viewAria', { name: dorm.name })}
      className={cn(
        'group card-elevated block overflow-hidden rounded-2xl bg-surface transition-all duration-200',
        availability.status === 'fully_booked' && 'opacity-[0.88]',
        'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2',
      )}
    >
      <article>
        <div
          className={cn(
            'relative w-full overflow-hidden bg-brand-soft',
            isCompact ? 'h-[140px]' : 'aspect-video',
          )}
        >
          {dorm.image_url ? (
            <DormImage
              src={dorm.image_url}
              alt={t('imageAlt', { name: dorm.name })}
              sizes={isCompact ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 100vw, 50vw'}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-brand-soft to-background">
              <Home className="size-7 text-muted-foreground/40" aria-hidden="true" />
              <span className="text-xs font-medium text-muted-foreground">
                {dorm.provider}
              </span>
            </div>
          )}

          <div className="absolute left-2.5 top-2.5">
            <AvailabilityBadge availability={availability} className="text-[10px] px-2 py-0.5" />
          </div>
        </div>

        <div className={cn('flex flex-col', isCompact ? 'gap-1 p-3.5' : 'gap-1.5 p-4')}>
          <Badge variant="secondary" className="w-fit text-[10px]">
            {dorm.provider}
          </Badge>

          <h3
            className={cn(
              'font-medium leading-snug text-foreground',
              isCompact ? 'text-sm' : 'text-base',
            )}
          >
            {dorm.name}
          </h3>

          {districtLabel && (
            <p className={cn('text-muted-foreground', isCompact ? 'text-xs' : 'text-[13px]')}>
              {districtLabel}
            </p>
          )}

          {!isCompact && !districtLabel && dorm.address && (
            <p className={cn('text-muted-foreground', isCompact ? 'text-xs' : 'text-[13px]')}>
              {dorm.address}
            </p>
          )}

          {!isCompact && districtLabel && dorm.address && (
            <p className="truncate text-[13px] text-muted-foreground">{dorm.address}</p>
          )}

          <div className="mt-1 flex items-center justify-between gap-2">
            <span
              className={cn(
                'font-semibold text-foreground',
                isCompact ? 'text-sm' : 'text-[15px]',
              )}
            >
              {priceLabel}
            </span>

            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
                    style={{ background: chances.bg, color: chances.color }}
                    onClick={(e) => e.preventDefault()}
                    aria-label={tChances('ariaLabel', { label: chances.label, tooltip: chances.tooltip })}
                  />
                }
              >
                {chances.emoji} {chances.label}
              </TooltipTrigger>
              <TooltipContent className="max-w-52 text-xs">{chances.tooltip}</TooltipContent>
            </Tooltip>
          </div>

          {!isCompact && depositLabel && (
            <p className="text-xs text-muted-foreground">{depositLabel}</p>
          )}

          {!isCompact && amenities.length > 0 && (
            <p className="text-xs text-muted-foreground">{amenities.join(' · ')}</p>
          )}

          {!isCompact && (
            <span className="mt-1 text-sm font-medium text-brand transition-colors group-hover:underline">
              {t('viewDetails')}
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}
