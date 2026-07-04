'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ArrowRight, HeartHandshake, Home, MapPin, PawPrint, Sofa } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import DormImage from '@/components/DormImage'
import {
  getChancesRating,
  type AvailabilityStatus,
  type Dorm,
} from '@/lib/helpers'
import { formatDistrictLabel, formatPriceLabel } from '@/lib/i18n-labels'
import AvailabilityBadge from '@/components/AvailabilityBadge'
import SaveDormButton from '@/components/SaveDormButton'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type Variant = 'compact' | 'full'

interface Props {
  dorm: Dorm
  availability: AvailabilityStatus
  variant?: Variant
  /** Only render the save/bookmark toggle when the viewer is signed in. */
  showSaveButton?: boolean
  initialSaved?: boolean
}

const AVAILABILITY_ACCENT: Record<AvailabilityStatus['status'], string> = {
  available: 'bg-brand-accent',
  unknown: 'bg-muted-foreground/30',
  fully_booked: 'bg-foreground/25',
}

export default function DormCard({
  dorm,
  availability,
  variant = 'full',
  showSaveButton = false,
  initialSaved = false,
}: Props) {
  const t = useTranslations('dormCard')
  const tChances = useTranslations('chances')
  const tLabels = useTranslations('labels')
  const chances = getChancesRating(dorm.provider, (key) => tChances(key))
  const districtLabel = formatDistrictLabel(dorm.district, (key, values) => tLabels(key, values))
  const priceLabel = formatPriceLabel(dorm.price_min, dorm.price_max, (key, values) => tLabels(key, values))
  const isCompact = variant === 'compact'

  const depositLabel = dorm.deposit_months
    ? dorm.deposit_months === 1
      ? t('depositMonths', { count: dorm.deposit_months })
      : t('depositMonthsPlural', { count: dorm.deposit_months })
    : dorm.deposit_eur
      ? t('depositEur', { amount: dorm.deposit_eur })
      : null

  const amenities: { icon: LucideIcon; label: string }[] = [
    ...(dorm.pets === true ? [{ icon: PawPrint, label: t('pets') }] : []),
    ...(dorm.couples === true ? [{ icon: HeartHandshake, label: t('couples') }] : []),
    ...(dorm.furnished === true ? [{ icon: Sofa, label: t('furnished') }] : []),
  ]

  return (
    <Link
      href={`/dorms/${dorm.slug}`}
      aria-label={t('viewAria', { name: dorm.name })}
      className={cn(
        'group card-elevated relative block overflow-hidden rounded-2xl bg-surface transition-all duration-200',
        availability.status === 'fully_booked' && 'opacity-[0.88]',
        'hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2',
      )}
    >
      <span
        className={cn('absolute inset-x-0 top-0 z-10 h-1', AVAILABILITY_ACCENT[availability.status])}
        aria-hidden="true"
      />

      <article>
        <div
          className={cn(
            'relative w-full overflow-hidden bg-brand-soft',
            isCompact ? 'h-[148px]' : 'aspect-[16/10]',
          )}
        >
          {dorm.image_url ? (
            <DormImage
              src={dorm.image_url}
              alt={t('imageAlt', { name: dorm.name })}
              sizes={isCompact ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 100vw, 50vw'}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-brand-soft via-surface-soft to-background">
              <span className="grid size-12 place-items-center rounded-2xl bg-surface/80 ring-1 ring-border/60">
                <Home className="size-6 text-brand/50" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {dorm.provider}
              </span>
            </div>
          )}

          <div className="absolute left-2.5 top-3.5">
            <AvailabilityBadge availability={availability} className="text-[10px] px-2 py-0.5 shadow-sm" />
          </div>

          {districtLabel && (
            <span className="absolute bottom-2.5 left-2.5 inline-flex max-w-[85%] items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{districtLabel}</span>
            </span>
          )}

          {showSaveButton && (
            <div className="absolute right-2.5 top-3.5">
              <SaveDormButton dormId={dorm.id} dormName={dorm.name} initialSaved={initialSaved} size="sm" />
            </div>
          )}
        </div>

        <div className={cn('flex flex-col', isCompact ? 'gap-1 p-3.5 pt-4' : 'gap-1.5 p-4 pt-4')}>
          <Badge variant="secondary" className="w-fit border-0 bg-brand-soft text-[10px] font-semibold text-brand">
            {dorm.provider}
          </Badge>

          <h3
            className={cn(
              'font-semibold leading-snug text-foreground transition-colors group-hover:text-brand',
              isCompact ? 'text-sm line-clamp-2' : 'text-base line-clamp-2',
            )}
          >
            {dorm.name}
          </h3>

          {!isCompact && dorm.address && (
            <p className="truncate text-[13px] text-muted-foreground">{dorm.address}</p>
          )}

          <div className="mt-1 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <span
                className={cn(
                  'block font-bold tracking-tight text-foreground',
                  isCompact ? 'text-sm' : 'text-lg',
                )}
              >
                {priceLabel}
              </span>
              {!isCompact && (
                <span className="text-[11px] text-muted-foreground">{t('perMonth')}</span>
              )}
            </div>

            <Popover>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
                    style={{ background: chances.bg, color: chances.color }}
                    onClick={(e) => e.preventDefault()}
                    aria-label={tChances('ariaLabel', { label: chances.label, tooltip: chances.tooltip })}
                  />
                }
              >
                {chances.emoji} {chances.label}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 text-xs text-popover-foreground">
                {chances.tooltip}
              </PopoverContent>
            </Popover>
          </div>

          {!isCompact && depositLabel && (
            <p className="text-xs text-muted-foreground">{depositLabel}</p>
          )}

          {!isCompact && amenities.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {amenities.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full bg-surface-soft px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/70"
                >
                  <Icon className="size-3 text-brand" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          )}

          {!isCompact && (
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand">
              {t('viewDetails')}
              <ArrowRight
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}
