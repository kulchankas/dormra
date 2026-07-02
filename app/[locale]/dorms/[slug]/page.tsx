import DormImage from '@/components/DormImage'
import { notFound } from 'next/navigation'
import { ArrowLeft, Bell, ExternalLink } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/i18n-metadata'
import { createClient } from '@/lib/supabase/server'
import { formatDistrictLabel, formatPriceLabel } from '@/lib/i18n-labels'
import { getAvailabilityStatusBulk } from '@/lib/availability'
import { localizeAvailability } from '@/lib/i18n-availability'
import AvailabilityBadge from '@/components/AvailabilityBadge'
import DormLocationMap from '@/components/DormLocationMap'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/navigation'

type PageProps = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('dorms').select('name, provider, district').eq('slug', slug).single()
  const t = await getTranslations({ locale, namespace: 'metadata' })
  if (!data) return buildPageMetadata(locale, `/dorms/${slug}`, t('dormNotFound'))
  return buildPageMetadata(
    locale,
    `/dorms/${slug}`,
    t('dormDetailTitle', { name: data.name }),
    t('dormDetailDescription', { provider: data.provider }),
  )
}

function alertHref(dorm: { district: number | null; price_max: number | null; price_min: number | null }) {
  const params = new URLSearchParams()
  if (dorm.district != null) params.set('districts', String(dorm.district))
  const maxPrice = dorm.price_max ?? dorm.price_min
  if (maxPrice != null) params.set('maxPrice', String(maxPrice))
  const qs = params.toString()
  return qs ? `/dashboard/alerts/new?${qs}` : '/dashboard/alerts/new'
}

export default async function DormDetailPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const t = await getTranslations('dormDetail')
  const tCard = await getTranslations('dormCard')
  const tAvail = await getTranslations('availability')
  const tLabels = await getTranslations('labels')

  const supabase = await createClient()
  const { data: dorm } = await supabase.from('dorms').select('*').eq('slug', slug).eq('active', true).single()
  if (!dorm) notFound()

  const availabilityMap = await getAvailabilityStatusBulk([dorm.id], supabase)
  const rawAvailability = availabilityMap.get(dorm.id) ?? { status: 'unknown' as const, label: 'Status unknown' }
  const availability = localizeAvailability(rawAvailability, (key) => tAvail(key))

  const districtLabel = formatDistrictLabel(dorm.district, (key, values) => tLabels(key, values))
  const priceLabel = formatPriceLabel(dorm.price_min, dorm.price_max, (key, values) => tLabels(key, values))
  const applyHref = dorm.apply_url || dorm.website_url

  function boolLabel(v: boolean | null): string {
    if (v === true) return t('yes')
    if (v === false) return t('no')
    return t('unknown')
  }

  const details: { label: string; value: string }[] = [
    { label: t('petsAllowed'), value: boolLabel(dorm.pets) },
    { label: t('couplesAllowed'), value: boolLabel(dorm.couples) },
    { label: t('furnished'), value: boolLabel(dorm.furnished) },
    ...(dorm.min_stay_months != null
      ? [{
          label: t('minStay'),
          value: `${dorm.min_stay_months} ${dorm.min_stay_months !== 1 ? t('months') : t('month')}`,
        }]
      : []),
    ...(dorm.max_stay_months != null
      ? [{
          label: t('maxStay'),
          value: `${dorm.max_stay_months} ${dorm.max_stay_months !== 1 ? t('months') : t('month')}`,
        }]
      : []),
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 pb-28 md:px-8 md:pb-8">
        <Link
          href="/dorms"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {t('back')}
        </Link>

        <div className="card-elevated relative mb-6 aspect-video w-full overflow-hidden rounded-2xl bg-brand-soft">
          {dorm.image_url ? (
            <DormImage
              src={dorm.image_url}
              alt={tCard('imageAlt', { name: dorm.name })}
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <span className="text-4xl opacity-25">🏠</span>
              <span className="text-sm font-medium text-muted-foreground">{dorm.provider}</span>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <AvailabilityBadge availability={availability} />
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {dorm.provider}
            </Badge>
            <AvailabilityBadge availability={availability} className="md:hidden" />
          </div>
          <h1 className="text-[22px] font-bold leading-snug tracking-tight text-foreground mb-1">
            {dorm.name}
          </h1>
          {districtLabel && (
            <p className="text-sm text-muted-foreground">{districtLabel}</p>
          )}
          {dorm.address && (
            <p className="text-sm text-muted-foreground">{dorm.address}</p>
          )}
        </div>

        <div className="card-elevated rounded-2xl bg-surface p-5 mb-4">
          <p className="text-xl font-semibold text-foreground mb-1">{priceLabel}</p>
          {dorm.deposit_months != null && (
            <p className="text-sm text-muted-foreground">
              {dorm.deposit_months !== 1
                ? t('depositMonthsPlural', { count: dorm.deposit_months })
                : t('depositMonths', { count: dorm.deposit_months })}
            </p>
          )}
          {dorm.deposit_eur != null && dorm.deposit_months == null && (
            <p className="text-sm text-muted-foreground">
              {t('depositEur', { amount: dorm.deposit_eur })}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {details.map(({ label, value }) => (
            <div key={label} className="card-elevated rounded-xl bg-surface p-3.5">
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {dorm.lat != null && dorm.lng != null && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-medium text-foreground">{t('location')}</h2>
            <DormLocationMap dorm={dorm} availability={availability} />
          </div>
        )}

        {dorm.notes && (
          <div className="card-elevated rounded-2xl bg-surface p-5 mb-6">
            <h2 className="text-sm font-medium text-foreground mb-2">{t('notes')}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{dorm.notes}</p>
          </div>
        )}

        <div className="hidden flex-wrap items-center gap-3 md:flex">
          {applyHref ? (
            <Button size="lg" className="h-11 gap-2 rounded-2xl px-7 text-sm" nativeButton={false} render={<a href={applyHref} target="_blank" rel="noopener noreferrer" />}>
              {t('applyOn', { provider: dorm.provider })}
              <ExternalLink className="size-3.5" />
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">{t('noApplyLink')}</p>
          )}
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            className="h-11 gap-2 rounded-2xl px-6 text-sm"
            render={<Link href={alertHref(dorm)} />}
          >
            <Bell className="size-3.5" aria-hidden="true" />
            {t('alertSimilar')}
          </Button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-surface/90 p-3 backdrop-blur-sm md:hidden safe-area-inset-bottom">
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          className="h-12 flex-1 gap-2 rounded-xl text-sm"
          render={<Link href={alertHref(dorm)} />}
        >
          <Bell className="size-3.5" aria-hidden="true" />
          {t('alertShort')}
        </Button>
        {applyHref && (
          <Button size="lg" className="h-12 flex-[1.4] gap-2 rounded-xl text-sm" nativeButton={false} render={<a href={applyHref} target="_blank" rel="noopener noreferrer" />}>
            {t('applyShort')}
            <ExternalLink className="size-3.5" />
          </Button>
        )}
      </div>
    </main>
  )
}
