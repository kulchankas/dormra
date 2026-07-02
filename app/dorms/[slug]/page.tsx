import Link from 'next/link'
import DormPhoto from '@/components/DormPhoto'
import { notFound } from 'next/navigation'
import { ArrowLeft, Bell, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDistrictLabel, formatPriceLabel, getAvailabilityStatusBulk } from '@/lib/helpers'
import AvailabilityBadge from '@/components/AvailabilityBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('dorms').select('name, provider, district').eq('slug', slug).single()
  if (!data) return { title: 'Dorm not found — Dormra' }
  return {
    title: `${data.name} — Dormra`,
    description: `${data.provider} dorm in Vienna. View pricing, availability, and apply directly through Dormra.`,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function boolLabel(v: boolean | null): string {
  if (v === true) return 'Yes ✓'
  if (v === false) return 'No'
  return '—'
}

function alertHref(dorm: { district: number | null; price_max: number | null; price_min: number | null }) {
  const params = new URLSearchParams()
  if (dorm.district != null) params.set('districts', String(dorm.district))
  const maxPrice = dorm.price_max ?? dorm.price_min
  if (maxPrice != null) params.set('maxPrice', String(maxPrice))
  const qs = params.toString()
  return qs ? `/dashboard/alerts/new?${qs}` : '/dashboard/alerts/new'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DormDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: dorm } = await supabase.from('dorms').select('*').eq('slug', slug).single()
  if (!dorm) notFound()

  const availabilityMap = await getAvailabilityStatusBulk([dorm.id])
  const availability = availabilityMap.get(dorm.id) ?? { status: 'unknown' as const, label: 'Status unknown' }

  const districtLabel = formatDistrictLabel(dorm.district)
  const priceLabel = formatPriceLabel(dorm.price_min, dorm.price_max)
  const applyHref = dorm.apply_url || dorm.website_url

  const details: { label: string; value: string }[] = [
    { label: 'Pets allowed', value: boolLabel(dorm.pets) },
    { label: 'Couples allowed', value: boolLabel(dorm.couples) },
    { label: 'Furnished', value: boolLabel(dorm.furnished) },
    ...(dorm.min_stay_months != null
      ? [{ label: 'Min stay', value: `${dorm.min_stay_months} month${dorm.min_stay_months !== 1 ? 's' : ''}` }]
      : []),
    ...(dorm.max_stay_months != null
      ? [{ label: 'Max stay', value: `${dorm.max_stay_months} month${dorm.max_stay_months !== 1 ? 's' : ''}` }]
      : []),
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 pb-28 md:px-8 md:pb-8">
        {/* Back */}
        <Link
          href="/dorms"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to all dorms
        </Link>

        {/* Hero image */}
        <div className="card-elevated relative mb-6 overflow-hidden rounded-2xl">
          <DormPhoto
            imageUrl={dorm.image_url}
            name={dorm.name}
            provider={dorm.provider}
            seed={dorm.slug}
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            frameClassName="aspect-video"
          />
          <div className="absolute left-3 top-3 z-[5]">
            <AvailabilityBadge availability={availability} />
          </div>
        </div>

        {/* Provider + name + location */}
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

        {/* Price & deposit */}
        <div className="card-elevated rounded-2xl bg-surface p-5 mb-4">
          <p className="text-xl font-semibold text-foreground mb-1">{priceLabel}</p>
          {dorm.deposit_months != null && (
            <p className="text-sm text-muted-foreground">
              Deposit: {dorm.deposit_months} month{dorm.deposit_months !== 1 ? 's' : ''}
            </p>
          )}
          {dorm.deposit_eur != null && dorm.deposit_months == null && (
            <p className="text-sm text-muted-foreground">Deposit: €{dorm.deposit_eur}</p>
          )}
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {details.map(({ label, value }) => (
            <div key={label} className="card-elevated rounded-xl bg-surface p-3.5">
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Notes */}
        {dorm.notes && (
          <div className="card-elevated rounded-2xl bg-surface p-5 mb-6">
            <h2 className="text-sm font-medium text-foreground mb-2">Notes</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{dorm.notes}</p>
          </div>
        )}

        {/* CTAs */}
        <div className="hidden flex-wrap items-center gap-3 md:flex">
          {applyHref ? (
            <Button size="lg" className="h-11 gap-2 rounded-2xl px-7 text-sm" nativeButton={false} render={<a href={applyHref} target="_blank" rel="noopener noreferrer" />}>
              Apply on {dorm.provider} website
              <ExternalLink className="size-3.5" />
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">No application link available yet.</p>
          )}
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            className="h-11 gap-2 rounded-2xl px-6 text-sm"
            render={<Link href={alertHref(dorm)} />}
          >
            <Bell className="size-3.5" aria-hidden="true" />
            Set alert for similar rooms
          </Button>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-surface/90 p-3 backdrop-blur-sm md:hidden safe-area-inset-bottom">
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          className="h-12 flex-1 gap-2 rounded-xl text-sm"
          render={<Link href={alertHref(dorm)} />}
        >
          <Bell className="size-3.5" aria-hidden="true" />
          Alert
        </Button>
        {applyHref && (
          <Button size="lg" className="h-12 flex-[1.4] gap-2 rounded-xl text-sm" nativeButton={false} render={<a href={applyHref} target="_blank" rel="noopener noreferrer" />}>
            Apply
            <ExternalLink className="size-3.5" />
          </Button>
        )}
      </div>
    </main>
  )
}
