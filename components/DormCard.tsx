'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Home } from 'lucide-react'
import {
  formatDistrictLabel,
  formatPriceLabel,
  getChancesScore,
  type AvailabilityStatus,
  type Dorm,
} from '@/lib/helpers'
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
  const chances = getChancesScore(dorm.provider)
  const districtLabel = formatDistrictLabel(dorm.district)
  const priceLabel = formatPriceLabel(dorm.price_min, dorm.price_max)
  const isCompact = variant === 'compact'

  const depositLabel = dorm.deposit_months
    ? `Deposit: ${dorm.deposit_months} month${dorm.deposit_months !== 1 ? 's' : ''}`
    : dorm.deposit_eur
    ? `Deposit: €${dorm.deposit_eur}`
    : null

  const amenities = [
    dorm.pets === true && 'Pets ✓',
    dorm.couples === true && 'Couples ✓',
    dorm.furnished === true && 'Furnished ✓',
  ].filter((x): x is string => typeof x === 'string')

  return (
    <Link
      href={`/dorms/${dorm.slug}`}
      aria-label={`View ${dorm.name}`}
      className={cn(
        'group block overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition-all duration-200',
        'hover:-translate-y-1 hover:border-border-strong hover:shadow-card',
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
            <Image
              src={dorm.image_url}
              alt={`${dorm.name} dormitory`}
              fill
              sizes={isCompact ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 100vw, 50vw'}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
            <span
              className={cn(
                'inline-block rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm',
                availability.status === 'available' && 'bg-brand-accent text-white',
                availability.status === 'fully_booked' && 'bg-muted-foreground text-white',
                availability.status === 'unknown' && 'bg-muted text-muted-foreground',
              )}
            >
              {availability.label}
            </span>
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

          {!isCompact && dorm.address && (
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
                    aria-label={`Application chances: ${chances.label}. ${chances.tooltip}`}
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
              View details →
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}
