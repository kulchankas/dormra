'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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
  scrape_url: string | null
  scrape_type: string | null
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

interface FilterState {
  maxPrice: number
  districts: number[]
  maxDepositMonths: number | ''
  pets: boolean
  couples: boolean
  furnished: boolean
  search: string
  sort: 'price_asc' | 'price_desc' | 'district_asc' | 'created_desc'
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

const DEFAULT_FILTERS: FilterState = {
  maxPrice: 1500,
  districts: [],
  maxDepositMonths: '',
  pets: false,
  couples: false,
  furnished: false,
  search: '',
  sort: 'price_asc',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Will later query availability_snapshots for real-time data
function getAvailabilityStatus(_dormId: string): {
  status: 'available' | 'fully_booked' | 'unknown'
  label: string
} {
  return { status: 'unknown', label: 'Status unknown' }
}

type ChancesRating = {
  emoji: string
  label: string
  color: string
  bg: string
  tooltip: string
}

function getChancesScore(provider: string): ChancesRating {
  const p = provider.toLowerCase()
  if (p === 'oead') {
    return {
      emoji: '🔴',
      label: 'Competitive',
      color: '#991B1B',
      bg: '#FEE2E2',
      tooltip: 'OeAD housing is heavily oversubscribed — prioritised by study type and programme.',
    }
  }
  if (p === 'home4students' || p === 'viennabase') {
    return {
      emoji: '🟡',
      label: 'Medium',
      color: '#92400E',
      bg: '#FEF3C7',
      tooltip: 'Moderate competition. Apply early and have a backup option ready.',
    }
  }
  // the-fizz, stuwo, wihast, kolpinghaus and others
  return {
    emoji: '🟢',
    label: 'Good chance',
    color: '#14532D',
    bg: '#DCFCE7',
    tooltip: 'Places are usually available — good odds if you apply promptly.',
  }
}

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

function countActiveFilters(f: FilterState): number {
  return (
    (f.maxPrice < 1500 ? 1 : 0) +
    (f.districts.length > 0 ? 1 : 0) +
    (f.maxDepositMonths !== '' ? 1 : 0) +
    (f.pets ? 1 : 0) +
    (f.couples ? 1 : 0) +
    (f.furnished ? 1 : 0)
  )
}

function isFiltersActive(f: FilterState): boolean {
  return countActiveFilters(f) > 0 || f.search !== ''
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl border bg-white overflow-hidden animate-pulse"
      style={{ borderColor: '#FFE4D6' }}
      aria-hidden="true"
    >
      {/* Image placeholder */}
      <div className="aspect-video w-full" style={{ background: '#FFE4D6' }} />
      {/* Body */}
      <div className="p-4 space-y-2.5">
        <div className="h-3 rounded-full" style={{ background: '#FFE4D6', width: '30%' }} />
        <div className="h-4 rounded-full" style={{ background: '#FFE4D6', width: '68%' }} />
        <div className="h-3 rounded-full" style={{ background: '#FFE4D6', width: '52%' }} />
        <div className="h-3 rounded-full" style={{ background: '#FFE4D6', width: '78%' }} />
        <div className="h-5 rounded-full" style={{ background: '#FFE4D6', width: '50%' }} />
        <div className="h-3 rounded-full" style={{ background: '#FFE4D6', width: '42%' }} />
        <div className="h-3 rounded-full" style={{ background: '#FFE4D6', width: '26%' }} />
      </div>
    </div>
  )
}

// ─── Dorm Card ────────────────────────────────────────────────────────────────

function DormCard({ dorm }: { dorm: Dorm }) {
  const availability = getAvailabilityStatus(dorm.id)
  const chances = getChancesScore(dorm.provider)

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
      className="group block rounded-2xl border bg-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B47] focus-visible:ring-offset-2"
      style={{ borderColor: '#FFE4D6' }}
      aria-label={`View ${dorm.name} details`}
    >
      <article>
        {/* ── Image ──────────────────────────────────────── */}
        <div className="relative aspect-video rounded-t-2xl overflow-hidden">
          {dorm.image_url ? (
            <img
              src={dorm.image_url}
              alt={`${dorm.name} dormitory exterior`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            // Intentional placeholder — image not yet seeded
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ background: '#FFE4D6' }}
            >
              <span className="text-2xl opacity-30">🏠</span>
              <span className="text-xs font-medium" style={{ color: '#6B5C53' }}>
                {dorm.provider}
              </span>
            </div>
          )}

          {/* Availability badge — top-left overlay */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
              style={
                availability.status === 'available'
                  ? { background: '#FF6B47', color: '#fff' }
                  : { background: 'rgba(255,248,244,0.9)', color: '#6B5C53' }
              }
            >
              {availability.label}
            </span>
          </div>

          {/* Reserved for future bookmark icon — top-right */}
          <div className="absolute top-2.5 right-2.5 w-8 h-8" aria-hidden="true" />
        </div>

        {/* ── Card body ──────────────────────────────────── */}
        <div className="p-4">
          {/* Provider badge */}
          <div className="mb-2">
            <span
              className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: '#FFE4D6', color: '#C2401E' }}
            >
              {dorm.provider}
            </span>
          </div>

          {/* Name */}
          <h2
            className="font-medium mb-1 leading-snug"
            style={{ color: '#1A1410', fontSize: '16px' }}
          >
            {dorm.name}
          </h2>

          {/* District */}
          {districtLabel && (
            <p className="mb-0.5" style={{ color: '#6B5C53', fontSize: '13px' }}>
              {districtLabel}
            </p>
          )}

          {/* Address */}
          {dorm.address && (
            <p
              className="truncate mb-3"
              style={{ color: '#6B5C53', fontSize: '13px' }}
            >
              {dorm.address}
            </p>
          )}

          {/* Price + chances badge */}
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <p className="font-semibold" style={{ color: '#1A1410', fontSize: '15px' }}>
              {priceLabel}
            </p>

            {/* Chances indicator with CSS-only tooltip */}
            <div className="relative group/chances">
              <span
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full cursor-help"
                style={{ background: chances.bg, color: chances.color }}
                aria-label={`Application chances: ${chances.label}`}
              >
                {chances.emoji} {chances.label}
              </span>
              <div
                className="absolute bottom-full left-0 mb-1.5 z-20 w-52 text-xs rounded-xl px-3 py-2 shadow-lg pointer-events-none opacity-0 group-hover/chances:opacity-100 transition-opacity duration-150"
                style={{ background: '#1A1410', color: '#fff' }}
                role="tooltip"
              >
                {chances.tooltip}
              </div>
            </div>
          </div>

          {/* Deposit */}
          {depositLabel && (
            <p className="text-xs mb-2" style={{ color: '#6B5C53' }}>
              {depositLabel}
            </p>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <p className="text-xs mb-3" style={{ color: '#6B5C53' }}>
              {amenities.join(' · ')}
            </p>
          )}

          <span
            className="text-sm font-medium transition-colors group-hover:underline"
            style={{ color: '#C2401E' }}
          >
            View details →
          </span>
        </div>
      </article>
    </Link>
  )
}

// ─── Filter Controls ──────────────────────────────────────────────────────────

function FilterControls({
  filters,
  onFiltersChange,
  onReset,
  showReset,
}: {
  filters: FilterState
  onFiltersChange: (f: FilterState) => void
  onReset: () => void
  showReset: boolean
}) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onFiltersChange({ ...filters, [key]: value })

  const toggleDistrict = (d: number) =>
    set(
      'districts',
      filters.districts.includes(d)
        ? filters.districts.filter((x) => x !== d)
        : [...filters.districts, d],
    )

  const activeCount = countActiveFilters(filters)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-medium" style={{ color: '#1A1410' }}>
          Filters
        </h2>
        {activeCount > 0 && (
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: '#FF6B47', color: '#fff' }}
          >
            {activeCount}
          </span>
        )}
      </div>

      {/* Max price slider */}
      <div>
        <label
          htmlFor="filter-max-price"
          className="block text-sm font-medium mb-2"
          style={{ color: '#1A1410' }}
        >
          Max price:{' '}
          <span style={{ color: '#C2401E' }}>
            {filters.maxPrice < 1500 ? `€${filters.maxPrice}/month` : 'Any'}
          </span>
        </label>
        <input
          id="filter-max-price"
          type="range"
          min={200}
          max={1500}
          step={50}
          value={filters.maxPrice}
          onChange={(e) => set('maxPrice', Number(e.target.value))}
          className="w-full accent-[#C2401E]"
          aria-valuemin={200}
          aria-valuemax={1500}
          aria-valuenow={filters.maxPrice}
          aria-valuetext={
            filters.maxPrice < 1500 ? `€${filters.maxPrice} per month` : 'Any price'
          }
        />
        <div
          className="flex justify-between text-xs mt-1"
          style={{ color: '#6B5C53' }}
          aria-hidden="true"
        >
          <span>€200</span>
          <span>€1,500+</span>
        </div>
      </div>

      {/* Districts */}
      <fieldset>
        <legend className="text-sm font-medium mb-2" style={{ color: '#1A1410' }}>
          Districts
        </legend>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {Object.entries(DISTRICTS).map(([k, name]) => {
            const num = Number(k)
            return (
              <label
                key={num}
                className="flex items-start gap-1.5 text-xs cursor-pointer leading-tight"
                style={{ color: '#6B5C53' }}
              >
                <input
                  type="checkbox"
                  checked={filters.districts.includes(num)}
                  onChange={() => toggleDistrict(num)}
                  className="mt-0.5 flex-shrink-0 accent-[#C2401E]"
                />
                <span>
                  {num} — {name}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* Max deposit months */}
      <div>
        <label
          htmlFor="filter-max-deposit"
          className="block text-sm font-medium mb-2"
          style={{ color: '#1A1410' }}
        >
          Max deposit (months)
        </label>
        <input
          id="filter-max-deposit"
          type="number"
          min={0}
          value={filters.maxDepositMonths}
          onChange={(e) =>
            set('maxDepositMonths', e.target.value === '' ? '' : Number(e.target.value))
          }
          placeholder="e.g. 2"
          className="w-full rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#FF6B47]"
          style={{ borderColor: '#FFE4D6', color: '#1A1410', background: '#fff' }}
        />
      </div>

      {/* Amenity toggles */}
      <fieldset>
        <legend className="text-sm font-medium mb-2" style={{ color: '#1A1410' }}>
          Amenities
        </legend>
        <div className="space-y-2">
          {(
            [
              ['pets', 'Pets allowed'],
              ['couples', 'Couples allowed'],
              ['furnished', 'Furnished'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="w-4 h-4 accent-[#C2401E]"
              />
              <span className="text-sm" style={{ color: '#1A1410' }}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Reset — only shown when filters active */}
      {showReset && (
        <button
          onClick={onReset}
          className="text-sm hover:underline cursor-pointer"
          style={{ color: '#6B5C53' }}
        >
          Reset filters
        </button>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DormsPage() {
  const [dorms, setDorms] = useState<Dorm[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('dorms')
      .select('*')
      .eq('active', true)
      .then(({ data, error }) => {
        if (!error && data) setDorms(data as Dorm[])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let result = [...dorms]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((d) => d.name.toLowerCase().includes(q))
    }
    if (filters.maxPrice < 1500) {
      result = result.filter((d) => d.price_min == null || d.price_min <= filters.maxPrice)
    }
    if (filters.districts.length > 0) {
      result = result.filter(
        (d) => d.district != null && filters.districts.includes(d.district),
      )
    }
    if (filters.maxDepositMonths !== '') {
      const max = Number(filters.maxDepositMonths)
      result = result.filter((d) => d.deposit_months == null || d.deposit_months <= max)
    }
    if (filters.pets) result = result.filter((d) => d.pets === true)
    if (filters.couples) result = result.filter((d) => d.couples === true)
    if (filters.furnished) result = result.filter((d) => d.furnished === true)

    result.sort((a, b) => {
      switch (filters.sort) {
        case 'price_asc':    return (a.price_min ?? 9999) - (b.price_min ?? 9999)
        case 'price_desc':   return (b.price_min ?? 0) - (a.price_min ?? 0)
        case 'district_asc': return (a.district ?? 99) - (b.district ?? 99)
        case 'created_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return result
  }, [dorms, filters])

  const active = isFiltersActive(filters)
  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const filterProps = {
    filters,
    onFiltersChange: setFilters,
    onReset: resetFilters,
    showReset: active,
  }

  return (
    <main className="min-h-screen" style={{ background: '#FFF8F4' }}>
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">

        {/* Mobile: filter toggle button */}
        <div className="flex items-center gap-3 mb-4 md:hidden">
          <button
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors"
            style={{
              borderColor: '#FFE4D6',
              background: mobileFiltersOpen ? '#FFE4D6' : '#fff',
              color: '#1A1410',
            }}
            aria-expanded={mobileFiltersOpen}
            aria-controls="mobile-filter-panel"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
            Filters
            {countActiveFilters(filters) > 0 && (
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: '#FF6B47', color: '#fff' }}
              >
                {countActiveFilters(filters)}
              </span>
            )}
          </button>
        </div>

        {/* Mobile: collapsible filter panel */}
        {mobileFiltersOpen && (
          <div
            id="mobile-filter-panel"
            className="mb-6 p-5 rounded-2xl border bg-white md:hidden"
            style={{ borderColor: '#FFE4D6' }}
          >
            <FilterControls {...filterProps} />
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex gap-8 items-start">

          {/* Desktop sidebar */}
          <aside
            aria-label="Dorm filters"
            className="hidden md:block flex-shrink-0 w-[280px]"
          >
            <div
              className="sticky top-6 rounded-2xl border bg-white p-5"
              style={{ borderColor: '#FFE4D6' }}
            >
              <FilterControls {...filterProps} />
            </div>
          </aside>

          {/* Main content area */}
          <div className="flex-1 min-w-0">

            {/* Results header */}
            <div className="mb-5">
              <h1 className="text-xl font-medium mb-3" style={{ color: '#1A1410' }}>
                {loading ? (
                  'Loading dorms…'
                ) : active ? (
                  <>
                    Showing{' '}
                    <span style={{ color: '#FF6B47' }}>{filtered.length}</span> of{' '}
                    {dorms.length} dorms
                  </>
                ) : (
                  <>
                    <span style={{ color: '#FF6B47' }}>{dorms.length}</span> dorms in Vienna
                  </>
                )}
              </h1>

              {/* Search + sort row */}
              <div className="flex flex-wrap gap-2">
                {/* Name search */}
                <div className="relative flex-1 min-w-[160px]">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B5C53"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    placeholder="Search by name…"
                    aria-label="Search dorms by name"
                    className="w-full rounded-full border pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FF6B47]"
                    style={{ borderColor: '#FFE4D6', color: '#1A1410', background: '#fff' }}
                  />
                </div>

                {/* Sort */}
                <div className="relative">
                  <label htmlFor="sort-select" className="sr-only">
                    Sort dorms by
                  </label>
                  <select
                    id="sort-select"
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        sort: e.target.value as FilterState['sort'],
                      }))
                    }
                    className="rounded-full border pl-3 pr-8 py-2 text-sm outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-[#FF6B47]"
                    style={{ borderColor: '#FFE4D6', color: '#1A1410', background: '#fff' }}
                  >
                    <option value="price_asc">Price (low to high)</option>
                    <option value="price_desc">Price (high to low)</option>
                    <option value="district_asc">District (ascending)</option>
                    <option value="created_desc">Recently added</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B5C53"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Loading skeleton grid */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Empty: no dorms in DB at all */}
            {!loading && dorms.length === 0 && (
              <div className="text-center py-24">
                <p className="text-lg font-medium mb-2" style={{ color: '#1A1410' }}>
                  No dorms found
                </p>
                <p className="text-sm" style={{ color: '#6B5C53' }}>
                  Check back soon — we&apos;re adding new listings.
                </p>
              </div>
            )}

            {/* Empty: filter mismatch */}
            {!loading && dorms.length > 0 && filtered.length === 0 && (
              <div className="text-center py-24">
                <p className="text-lg font-medium mb-2" style={{ color: '#1A1410' }}>
                  No dorms match your filters
                </p>
                <p className="text-sm mb-6" style={{ color: '#6B5C53' }}>
                  Try widening your search
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ background: '#C2401E', color: '#fff' }}
                >
                  Reset filters
                </button>
              </div>
            )}

            {/* Card grid */}
            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((dorm) => (
                  <DormCard key={dorm.id} dorm={dorm} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
