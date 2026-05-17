import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  getAvailabilityStatusBulk,
  getChancesScore,
  ordinalSuffix,
  DISTRICT_NAMES,
  type AvailabilityStatus,
  type Dorm,
} from '@/lib/helpers'
import HeroSearch from '@/components/HeroSearch'

// ─── Dorm Preview Card ────────────────────────────────────────────────────────

function DormPreviewCard({ dorm, availability }: { dorm: Dorm; availability: AvailabilityStatus }) {
  const chances = getChancesScore(dorm.provider)

  const districtLabel = dorm.district
    ? `${dorm.district}${ordinalSuffix(dorm.district)} district · ${DISTRICT_NAMES[dorm.district] ?? ''}`
    : null

  const priceLabel =
    dorm.price_min && dorm.price_max
      ? `€${dorm.price_min}–${dorm.price_max} / month`
      : dorm.price_min
      ? `From €${dorm.price_min} / month`
      : 'Price on request'

  return (
    <Link
      href={`/dorms/${dorm.slug}`}
      className="group block bg-white overflow-hidden transition-all duration-200 hover:-translate-y-[2px] hover:border-[#F0C9B5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B47] focus-visible:ring-offset-2"
      style={{
        borderRadius: '14px',
        border: '1px solid #FFE4D6',
      }}
      aria-label={`View ${dorm.name}`}
    >
      <article>
        {/* Image area — fixed 140px height per spec */}
        <div className="relative w-full overflow-hidden" style={{ height: '140px' }}>
          {dorm.image_url ? (
            <img
              src={dorm.image_url}
              alt={`${dorm.name} dormitory`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFE4D6 0%, #FFF8F4 100%)' }}
            >
              <span className="text-[12px]" style={{ color: '#6B5C53' }}>Photo coming soon</span>
            </div>
          )}

          {/* Availability badge — top-left */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className="inline-block font-medium"
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '999px',
                ...(availability.status === 'available'
                  ? { background: '#FF6B47', color: '#fff' }
                  : availability.status === 'fully_booked'
                  ? { background: '#6B5C53', color: '#fff' }
                  : { background: '#E5E5E5', color: '#6B5C53' }),
              }}
            >
              {availability.label}
            </span>
          </div>

          {/* Reserved for future heart icon — top-right */}
          <div className="absolute top-2.5 right-2.5 w-8 h-8" aria-hidden="true" />
        </div>

        {/* Card body */}
        <div style={{ padding: '12px 14px' }}>
          {/* Provider pill */}
          <span
            className="inline-block font-medium"
            style={{
              fontSize: '10px',
              padding: '3px 9px',
              borderRadius: '999px',
              background: '#FAECE7',
              color: '#993C1D',
            }}
          >
            {dorm.provider}
          </span>

          {/* Dorm name */}
          <h3
            className="font-medium leading-snug"
            style={{ fontSize: '14px', color: '#1A1410', marginTop: '4px', marginBottom: '4px' }}
          >
            {dorm.name}
          </h3>

          {/* Location */}
          {districtLabel && (
            <p style={{ fontSize: '12px', color: '#6B5C53', marginBottom: '6px' }}>
              {districtLabel}
            </p>
          )}

          {/* Price + chances pill */}
          <div className="flex items-center justify-between">
            <span className="font-medium" style={{ fontSize: '13px', color: '#1A1410' }}>
              {priceLabel}
            </span>
            <span
              className="inline-block font-medium"
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '999px',
                background: chances.bg,
                color: chances.color,
              }}
            >
              {chances.label}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const { data } = await supabase
    .from('dorms')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const previewDorms = (data ?? []) as Dorm[]
  const availabilityMap = await getAvailabilityStatusBulk(previewDorms.map(d => d.id))

  return (
    <main>
      {/* ── 1. Hero ── */}
      <section
        className="w-full pt-10 pb-[30px] md:pt-[60px] md:pb-10"
        style={{ background: '#FFF8F4' }}
        aria-label="Search student dorms in Vienna"
      >
        <div
          className="mx-auto flex flex-col items-center text-center"
          style={{ maxWidth: '720px', padding: '0 24px' }}
        >
          <h1
            className="font-medium text-[24px] md:text-[32px]"
            style={{ color: '#1A1410', lineHeight: '1.2' }}
          >
            Every Vienna student dorm. One search.
          </h1>

          <p style={{ fontSize: '15px', color: '#6B5C53', marginTop: '12px' }}>
            Stop refreshing 8 websites a day — Dormra watches them for you.
          </p>

          <div className="w-full flex justify-center" style={{ marginTop: '24px' }}>
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* ── 2. How it works ── */}
      <section
        className="w-full bg-white"
        aria-label="How Dormra works"
        style={{ padding: '32px 24px' }}
      >
        <div className="mx-auto" style={{ maxWidth: '1100px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                {
                  step: '01',
                  title: 'Search & filter',
                  desc: 'All providers in one place — filter by price, district, deposit.',
                },
                {
                  step: '02',
                  title: 'Set an alert',
                  desc: 'Tell Dormra your criteria once. We check every 15 minutes.',
                },
                {
                  step: '03',
                  title: 'Get notified',
                  desc: 'Email or Telegram the moment a matching room opens up.',
                },
              ] as const
            ).map(({ step, title, desc }) => (
              <div
                key={step}
                style={{
                  background: '#FFF8F4',
                  border: '1px solid #FFE4D6',
                  borderRadius: '12px',
                  padding: '16px 18px',
                }}
              >
                <p
                  className="font-medium"
                  style={{ fontSize: '11px', color: '#C2401E', marginBottom: '6px' }}
                >
                  {step}
                </p>
                <p
                  className="font-medium"
                  style={{ fontSize: '15px', color: '#1A1410', marginBottom: '4px' }}
                >
                  {title}
                </p>
                <p style={{ fontSize: '12px', color: '#6B5C53' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Dorms preview ── */}
      <section
        className="w-full bg-white"
        aria-label="Dorms in Vienna"
        style={{ paddingTop: '16px', paddingBottom: '32px', paddingLeft: '24px', paddingRight: '24px' }}
      >
        <div className="mx-auto" style={{ maxWidth: '1100px' }}>
          {/* Header row */}
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <h2 className="font-medium" style={{ fontSize: '18px', color: '#1A1410' }}>
              Dorms in Vienna
            </h2>
            <Link
              href="/dorms"
              className="hover:underline"
              style={{ fontSize: '13px', color: '#C2401E' }}
            >
              View all →
            </Link>
          </div>

          {/* Cards grid: 1 col → 2 col (sm) → 3 col (md) */}
          {previewDorms.length > 0 ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
              style={{ gap: '14px' }}
            >
              {previewDorms.map((dorm) => (
                <DormPreviewCard
                  key={dorm.id}
                  dorm={dorm}
                  availability={availabilityMap.get(dorm.id) ?? { status: 'unknown', label: 'Status unknown' }}
                />
              ))}
            </div>
          ) : (
            <p
              className="text-center py-10"
              style={{ fontSize: '14px', color: '#6B5C53' }}
            >
              Listings coming soon — check back shortly.
            </p>
          )}
        </div>
      </section>

      {/* ── 4. Footer ── */}
      <footer
        className="w-full flex items-center justify-between"
        style={{
          background: '#FFF8F4',
          borderTop: '1px solid #FFE4D6',
          padding: '16px 24px',
        }}
      >
        <p style={{ fontSize: '12px', color: '#6B5C53' }}>
          Dormra · Vienna student housing
        </p>
        <nav className="flex items-center gap-3" aria-label="Footer links">
          <Link
            href="/privacy"
            className="hover:underline"
            style={{ fontSize: '12px', color: '#6B5C53' }}
          >
            Privacy
          </Link>
          <span style={{ color: '#6B5C53', fontSize: '12px' }} aria-hidden="true">·</span>
          <Link
            href="/terms"
            className="hover:underline"
            style={{ fontSize: '12px', color: '#6B5C53' }}
          >
            Terms
          </Link>
        </nav>
      </footer>
    </main>
  )
}
