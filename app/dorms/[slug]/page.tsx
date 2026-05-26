import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDistrictLabel, formatPriceLabel } from '@/lib/helpers'
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
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl bg-brand-soft">
          {dorm.image_url ? (
            <Image
              src={dorm.image_url}
              alt={`${dorm.name} dormitory`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <span className="text-4xl opacity-25">🏠</span>
              <span className="text-sm font-medium text-muted-foreground">{dorm.provider}</span>
            </div>
          )}
        </div>

        {/* Provider + name + location */}
        <div className="mb-6">
          <Badge variant="secondary" className="mb-2 text-[10px]">
            {dorm.provider}
          </Badge>
          <h1 className="text-[22px] font-medium leading-snug text-foreground mb-1">
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
        <div className="rounded-2xl border border-border bg-surface p-5 mb-4">
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
            <div key={label} className="rounded-xl border border-border bg-surface p-3.5">
              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
              <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {/* Notes */}
        {dorm.notes && (
          <div className="rounded-2xl border border-border bg-surface p-5 mb-6">
            <h2 className="text-sm font-medium text-foreground mb-2">Notes</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{dorm.notes}</p>
          </div>
        )}

        {/* Desktop apply CTA */}
        {applyHref ? (
          <Button size="lg" className="hidden md:inline-flex h-11 gap-2 rounded-2xl px-7 text-sm" nativeButton={false} render={<a href={applyHref} target="_blank" rel="noopener noreferrer" />}>
            Apply on {dorm.provider} website
            <ExternalLink className="size-3.5" />
          </Button>
        ) : (
          <p className="hidden md:block text-sm text-muted-foreground">No application link available yet.</p>
        )}
      </div>

      {/* Mobile sticky Apply bar */}
      {applyHref && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex md:hidden border-t border-border bg-surface/90 backdrop-blur-sm px-4 py-3 safe-area-inset-bottom">
          <Button size="lg" className="h-12 w-full gap-2 rounded-xl text-sm" nativeButton={false} render={<a href={applyHref} target="_blank" rel="noopener noreferrer" />}>
            Apply on {dorm.provider} website
            <ExternalLink className="size-3.5" />
          </Button>
        </div>
      )}
    </main>
  )
}
