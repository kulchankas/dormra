import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Dorm {
  id: string
  slug: string
  provider: string
  name: string
  address: string | null
  district: number | null
  price_min: number | null
  price_max: number | null
  deposit_eur: number | null
  deposit_months: number | null
  website_url: string | null
  apply_url: string | null
  pets: boolean | null
  couples: boolean | null
  furnished: boolean | null
  min_stay_months: number | null
  max_stay_months: number | null
  notes: string | null
  active: boolean
  created_at: string
  image_url?: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DISTRICTS: Record<number, string> = {
  1: 'Innere Stadt',
  2: 'Leopoldstadt',
  3: 'Landstraße',
  4: 'Wieden',
  5: 'Margareten',
  6: 'Mariahilf',
  7: 'Neubau',
  8: 'Josefstadt',
  9: 'Alsergrund',
  10: 'Favoriten',
  11: 'Simmering',
  12: 'Meidling',
  13: 'Hietzing',
  14: 'Penzing',
  15: 'Rudolfsheim-Fünfhaus',
  16: 'Ottakring',
  17: 'Hernals',
  18: 'Währing',
  19: 'Döbling',
  20: 'Brigittenau',
  21: 'Floridsdorf',
  22: 'Donaustadt',
  23: 'Liesing',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ordinalSuffix(n: number): string {
  const v = n % 100
  if (v >= 11 && v <= 13) return 'th'
  switch (v % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

function boolLabel(v: boolean | null): string {
  if (v === true) return 'Yes ✓'
  if (v === false) return 'No'
  return '—'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// Next.js 16: params is a Promise — must be awaited
export default async function DormDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: dorm } = await supabase
    .from('dorms')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!dorm) notFound()

  const districtName = dorm.district ? DISTRICTS[dorm.district] : null
  const districtLabel = dorm.district
    ? `${dorm.district}${ordinalSuffix(dorm.district)} district${districtName ? ` · ${districtName}` : ''}`
    : null

  const priceLabel =
    dorm.price_min && dorm.price_max
      ? `€${dorm.price_min}–${dorm.price_max} / month`
      : dorm.price_min
      ? `From €${dorm.price_min} / month`
      : 'Price on request'

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

  const applyHref = dorm.apply_url || dorm.website_url

  return (
    <main className="min-h-screen" style={{ background: '#FFF8F4' }}>
      <div className="max-w-3xl mx-auto px-4 py-8 md:px-8">

        {/* Back link */}
        <Link
          href="/dorms"
          className="inline-flex items-center gap-1.5 text-sm mb-8 hover:underline"
          style={{ color: '#6B5C53' }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 5 5 12 12 19" />
          </svg>
          Back to all dorms
        </Link>

        {/* Hero image */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6">
          {dorm.image_url ? (
            <img
              src={dorm.image_url}
              alt={`${dorm.name} dormitory`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ background: '#FFE4D6' }}
            >
              <span className="text-4xl opacity-25">🏠</span>
              <span className="text-sm font-medium" style={{ color: '#6B5C53' }}>
                {dorm.provider}
              </span>
            </div>
          )}
        </div>

        {/* Provider + name + location */}
        <div className="mb-6">
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2"
            style={{ background: '#FFE4D6', color: '#C2401E' }}
          >
            {dorm.provider}
          </span>
          <h1
            className="font-medium mb-1 leading-snug"
            style={{ color: '#1A1410', fontSize: '22px' }}
          >
            {dorm.name}
          </h1>
          {districtLabel && (
            <p className="text-sm mb-0.5" style={{ color: '#6B5C53' }}>
              {districtLabel}
            </p>
          )}
          {dorm.address && (
            <p className="text-sm" style={{ color: '#6B5C53' }}>
              {dorm.address}
            </p>
          )}
        </div>

        {/* Price & deposit card */}
        <div
          className="rounded-2xl border p-5 mb-4"
          style={{ borderColor: '#FFE4D6', background: '#fff' }}
        >
          <p
            className="font-semibold mb-1"
            style={{ color: '#1A1410', fontSize: '20px' }}
          >
            {priceLabel}
          </p>
          {dorm.deposit_months != null && (
            <p className="text-sm" style={{ color: '#6B5C53' }}>
              Deposit: {dorm.deposit_months} month{dorm.deposit_months !== 1 ? 's' : ''}
            </p>
          )}
          {dorm.deposit_eur != null && dorm.deposit_months == null && (
            <p className="text-sm" style={{ color: '#6B5C53' }}>
              Deposit: €{dorm.deposit_eur}
            </p>
          )}
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {details.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border p-3.5"
              style={{ borderColor: '#FFE4D6', background: '#fff' }}
            >
              <p className="text-xs mb-0.5" style={{ color: '#6B5C53' }}>
                {label}
              </p>
              <p className="text-sm font-medium" style={{ color: '#1A1410' }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Notes */}
        {dorm.notes && (
          <div
            className="rounded-2xl border p-5 mb-6"
            style={{ borderColor: '#FFE4D6', background: '#fff' }}
          >
            <h2 className="text-sm font-medium mb-2" style={{ color: '#1A1410' }}>
              Notes
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#6B5C53' }}>
              {dorm.notes}
            </p>
          </div>
        )}

        {/* Apply CTA */}
        {applyHref ? (
          <a
            href={applyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-medium text-white w-full justify-center md:w-auto md:justify-start transition-opacity hover:opacity-90"
            style={{ background: '#C2401E' }}
          >
            Apply on {dorm.provider} website
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        ) : (
          <p className="text-sm" style={{ color: '#6B5C53' }}>
            No application link available yet.
          </p>
        )}
      </div>
    </main>
  )
}
