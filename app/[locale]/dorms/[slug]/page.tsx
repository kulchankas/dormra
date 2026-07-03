import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { de, ru, enGB } from 'date-fns/locale'
import { ArrowLeft, Bell, Bookmark, ExternalLink, GraduationCap, Globe, Building2, MapPin, Info } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/i18n-metadata'
import { createClient } from '@/lib/supabase/server'
import { formatDistrictLabel, formatPriceLabel } from '@/lib/i18n-labels'
import { getAvailabilityStatusBulk, availabilityMapToRecord, type AvailabilityStatus } from '@/lib/availability'
import { localizeAvailability, localizeAvailabilityRecord } from '@/lib/i18n-availability'
import { nearestUniversities } from '@/lib/universities'
import { getDormGallery } from '@/lib/dorm-images'
import { absoluteUrl, localePath } from '@/lib/i18n-path'
import { type Dorm } from '@/lib/helpers'
import AvailabilityBadge from '@/components/AvailabilityBadge'
import DormLocationMap from '@/components/DormLocationMap'
import DormCard from '@/components/DormCard'
import DormGallery from '@/components/DormGallery'
import SaveDormButton from '@/components/SaveDormButton'
import DormTrackerPanel from '@/components/DormTrackerPanel'
import { type TrackerStatus } from '@/lib/tracker'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/navigation'

const DATE_LOCALES = { en: enGB, de, ru } as const

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
  const dateLocale = DATE_LOCALES[locale as keyof typeof DATE_LOCALES] ?? enGB

  const supabase = await createClient()
  const { data: dorm } = await supabase.from('dorms').select('*').eq('slug', slug).eq('active', true).single()
  if (!dorm) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  let isSaved = false
  let trackerId: string | null = null
  let trackerStatus: TrackerStatus | null = null
  if (user) {
    const { data: trackerRow } = await supabase
      .from('tracker')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('dorm_id', dorm.id)
      .maybeSingle()
    isSaved = !!trackerRow
    trackerId = trackerRow?.id ?? null
    trackerStatus = (trackerRow?.status as TrackerStatus | undefined) ?? null
  }

  const availabilityMap = await getAvailabilityStatusBulk([dorm.id], supabase)
  const rawAvailability = availabilityMap.get(dorm.id) ?? { status: 'unknown' as const, label: 'Status unknown' }
  const availability = localizeAvailability(rawAvailability, (key) => tAvail(key))

  const { data: snapshotRows } = await supabase.rpc('get_latest_snapshots', { p_dorm_ids: [dorm.id] })
  const lastCheckedAt = snapshotRows?.[0]?.scraped_at ?? null

  const districtLabel = formatDistrictLabel(dorm.district, (key, values) => tLabels(key, values))
  const priceLabel = formatPriceLabel(dorm.price_min, dorm.price_max, (key, values) => tLabels(key, values))
  const applyHref = dorm.apply_url || dorm.website_url
  const providerSiteHref = dorm.website_url || dorm.apply_url
  const websiteHref =
    dorm.website_url && dorm.website_url !== applyHref ? dorm.website_url : null

  const universities = dorm.lat != null && dorm.lng != null
    ? nearestUniversities({ lat: dorm.lat, lng: dorm.lng }, 3)
    : []

  const galleryImages = await getDormGallery(dorm.id, supabase)
  const allImages = galleryImages.length > 0 ? galleryImages : dorm.image_url ? [dorm.image_url] : []

  let similarDorms: Dorm[] = []
  let similarAvailability: Record<string, AvailabilityStatus> = {}
  if (dorm.district != null) {
    const { data: sameDistrict } = await supabase
      .from('dorms')
      .select('*')
      .eq('active', true)
      .eq('district', dorm.district)
      .neq('id', dorm.id)
      .limit(3)
    similarDorms = (sameDistrict ?? []) as Dorm[]
  }
  if (similarDorms.length === 0) {
    const { data: sameProvider } = await supabase
      .from('dorms')
      .select('*')
      .eq('active', true)
      .eq('provider', dorm.provider)
      .neq('id', dorm.id)
      .limit(3)
    similarDorms = (sameProvider ?? []) as Dorm[]
  }
  if (similarDorms.length > 0) {
    const similarMap = await getAvailabilityStatusBulk(similarDorms.map((d) => d.id), supabase)
    similarAvailability = localizeAvailabilityRecord(availabilityMapToRecord(similarMap), (key) => tAvail(key))
  }

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    name: dorm.name,
    url: absoluteUrl(localePath(`/dorms/${dorm.slug}`, locale)),
    ...(allImages.length > 0 ? { image: allImages } : {}),
    ...(dorm.address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: dorm.address,
            addressLocality: 'Vienna',
            addressCountry: 'AT',
          },
        }
      : {}),
    ...(dorm.lat != null && dorm.lng != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: dorm.lat, longitude: dorm.lng } }
      : {}),
    ...(dorm.price_min != null
      ? {
          priceRange: dorm.price_max
            ? `€${dorm.price_min}-${dorm.price_max}`
            : `From €${dorm.price_min}`,
        }
      : {}),
  }

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-8 pb-28 md:px-8 md:pb-8">
        <Link
          href="/dorms"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {t('back')}
        </Link>

        <div className="card-elevated relative mb-6 aspect-video w-full overflow-hidden rounded-2xl bg-brand-soft">
          {allImages.length > 0 ? (
            <DormGallery images={allImages} alt={tCard('imageAlt', { name: dorm.name })} />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <span className="text-4xl opacity-25">🏠</span>
              <span className="text-sm font-medium text-muted-foreground">{dorm.provider}</span>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <AvailabilityBadge availability={availability} />
          </div>
          <div className="absolute right-3 top-3">
            {user ? (
              <SaveDormButton dormId={dorm.id} dormName={dorm.name} initialSaved={isSaved} />
            ) : (
              <Link
                href={{ pathname: '/login', query: { redirect: `/dorms/${dorm.slug}` } }}
                aria-label={t('loginToSaveAria')}
                className="grid size-9 place-items-center rounded-full bg-white/90 text-foreground backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
              >
                <Bookmark className="size-4" aria-hidden="true" />
              </Link>
            )}
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
          {lastCheckedAt && (
            <p className="mt-2 text-xs text-muted-foreground/80">
              {t('lastChecked', {
                time: formatDistanceToNow(new Date(lastCheckedAt), { addSuffix: true, locale: dateLocale }),
              })}
            </p>
          )}
        </div>

        <div className="card-elevated rounded-2xl bg-surface p-5 mb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                {t('monthlyPrice')}
              </p>
              <p className="text-xl font-semibold text-foreground">{priceLabel}</p>
              {dorm.price_min != null && dorm.price_max != null && dorm.price_min !== dorm.price_max && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('priceRangeDetail', { min: dorm.price_min, max: dorm.price_max })}
                </p>
              )}
            </div>
            <AvailabilityBadge availability={availability} />
          </div>
          {(dorm.deposit_months != null || dorm.deposit_eur != null) && (
            <div className="border-t border-border/60 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                {t('deposit')}
              </p>
              {dorm.deposit_months != null && (
                <p className="text-sm text-foreground">
                  {dorm.deposit_months !== 1
                    ? t('depositMonthsPlural', { count: dorm.deposit_months })
                    : t('depositMonths', { count: dorm.deposit_months })}
                </p>
              )}
              {dorm.deposit_eur != null && dorm.deposit_months == null && (
                <p className="text-sm text-foreground">
                  {t('depositEur', { amount: dorm.deposit_eur })}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="card-elevated rounded-2xl bg-surface p-5 mb-4">
          <h2 className="text-sm font-medium text-foreground mb-3">{t('atAGlance')}</h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Building2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <dt className="text-xs text-muted-foreground">{t('providerLabel')}</dt>
                <dd className="text-sm font-medium text-foreground">{dorm.provider}</dd>
              </div>
            </div>
            {districtLabel && (
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-muted-foreground">{t('district')}</dt>
                  <dd className="text-sm font-medium text-foreground">{districtLabel}</dd>
                </div>
              </div>
            )}
            {dorm.address && (
              <div className="flex items-start gap-2.5 sm:col-span-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-muted-foreground">{t('address')}</dt>
                  <dd className="text-sm font-medium text-foreground">{dorm.address}</dd>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              <div>
                <dt className="text-xs text-muted-foreground">{t('availability')}</dt>
                <dd className="text-sm font-medium text-foreground">{availability.label}</dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {details.map(({ label, value }) => (
            <div key={label} className="card-elevated rounded-xl bg-surface p-3.5">
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {user && (
          <DormTrackerPanel
            dormId={dorm.id}
            dormName={dorm.name}
            provider={dorm.provider}
            isSaved={isSaved}
            trackerId={trackerId}
            trackerStatus={trackerStatus}
          />
        )}

        {providerSiteHref && (
          <div className="card-elevated rounded-2xl bg-surface-soft p-5 mb-6">
            <h2 className="text-sm font-medium text-foreground mb-1">{t('aboutProvider', { provider: dorm.provider })}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">{t('providerHint', { provider: dorm.provider })}</p>
            <a
              href={providerSiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
            >
              <Globe className="size-3.5" aria-hidden="true" />
              {t('visitProviderSite', { provider: dorm.provider })}
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </div>
        )}

        {dorm.lat != null && dorm.lng != null && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-medium text-foreground">{t('location')}</h2>
            <DormLocationMap dorm={dorm} availability={availability} />
            {universities.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {universities.map((u) => (
                  <li
                    key={u.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs text-muted-foreground ring-1 ring-border"
                  >
                    <GraduationCap className="size-3.5 text-brand" aria-hidden="true" />
                    {u.name}
                    <span className="font-medium text-foreground">{t('kmAway', { km: u.km.toFixed(1) })}</span>
                  </li>
                ))}
              </ul>
            )}
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
          {websiteHref && (
            <Button
              variant="ghost"
              size="lg"
              nativeButton={false}
              className="h-11 gap-1.5 rounded-2xl px-4 text-sm text-muted-foreground"
              render={<a href={websiteHref} target="_blank" rel="noopener noreferrer" />}
            >
              <Globe className="size-3.5" aria-hidden="true" />
              {t('visitWebsite')}
            </Button>
          )}
        </div>

        {similarDorms.length > 0 && (
          <div className="mt-10 border-t border-border pt-8">
            <h2 className="mb-4 text-sm font-semibold text-foreground">{t('similarDorms')}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {similarDorms.map((similar) => (
                <DormCard
                  key={similar.id}
                  dorm={similar}
                  availability={
                    similarAvailability[similar.id] ?? { status: 'unknown', label: tAvail('unknown') }
                  }
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}
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
