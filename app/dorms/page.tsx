'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  DISTRICT_NAMES,
  getAvailabilityStatusBulk,
  type AvailabilityStatus,
  type Dorm,
} from '@/lib/helpers'
import DormCard from '@/components/DormCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'price_asc' | 'price_desc' | 'district_asc' | 'created_desc'

interface FilterState {
  priceMin: number
  priceMax: number
  districts: number[]
  providers: string[]
  maxDepositMonths: number | ''
  stayMonths: number | ''
  pets: boolean
  couples: boolean
  furnished: boolean
  availableOnly: boolean
  search: string
  sort: SortKey
}

const DEFAULT_FILTERS: FilterState = {
  priceMin: 0,
  priceMax: 1500,
  districts: [],
  providers: [],
  maxDepositMonths: '',
  stayMonths: '',
  pets: false,
  couples: false,
  furnished: false,
  availableOnly: false,
  search: '',
  sort: 'price_asc',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countActiveFilters(f: FilterState): number {
  return (
    (f.priceMin > 0 || f.priceMax < 1500 ? 1 : 0) +
    (f.districts.length > 0 ? 1 : 0) +
    (f.providers.length > 0 ? 1 : 0) +
    (f.maxDepositMonths !== '' ? 1 : 0) +
    (f.stayMonths !== '' ? 1 : 0) +
    (f.pets ? 1 : 0) +
    (f.couples ? 1 : 0) +
    (f.furnished ? 1 : 0) +
    (f.availableOnly ? 1 : 0)
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DormCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <Skeleton className="aspect-video w-full" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
        <Skeleton className="h-3 w-1/2 rounded-full" />
        <Skeleton className="h-3 w-3/4 rounded-full" />
        <Skeleton className="h-5 w-1/2 rounded-full" />
      </div>
    </div>
  )
}

// ─── Active filter chips ──────────────────────────────────────────────────────

function FilterChips({
  filters,
  onChange,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
}) {
  const chips: { key: string; label: string; onRemove: () => void }[] = []

  if (filters.availableOnly)
    chips.push({ key: 'avail', label: 'Available now', onRemove: () => onChange({ ...filters, availableOnly: false }) })
  if (filters.priceMin > 0 || filters.priceMax < 1500)
    chips.push({ key: 'price', label: `€${filters.priceMin}–${filters.priceMax < 1500 ? filters.priceMax : '1500+'}/mo`, onRemove: () => onChange({ ...filters, priceMin: 0, priceMax: 1500 }) })
  if (filters.maxDepositMonths !== '')
    chips.push({ key: 'deposit', label: `Deposit ≤ ${filters.maxDepositMonths} mo`, onRemove: () => onChange({ ...filters, maxDepositMonths: '' }) })
  if (filters.stayMonths !== '')
    chips.push({ key: 'stay', label: `Stay: ${filters.stayMonths} mo`, onRemove: () => onChange({ ...filters, stayMonths: '' }) })
  filters.providers.forEach((p) =>
    chips.push({ key: `p-${p}`, label: p, onRemove: () => onChange({ ...filters, providers: filters.providers.filter((x) => x !== p) }) }),
  )
  filters.districts.forEach((d) =>
    chips.push({ key: `d-${d}`, label: `${d}. ${DISTRICT_NAMES[d]}`, onRemove: () => onChange({ ...filters, districts: filters.districts.filter((x) => x !== d) }) }),
  )
  if (filters.pets) chips.push({ key: 'pets', label: 'Pets', onRemove: () => onChange({ ...filters, pets: false }) })
  if (filters.couples) chips.push({ key: 'couples', label: 'Couples', onRemove: () => onChange({ ...filters, couples: false }) })
  if (filters.furnished) chips.push({ key: 'furnished', label: 'Furnished', onRemove: () => onChange({ ...filters, furnished: false }) })

  if (chips.length === 0) return null
  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span key={chip.key} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand">
          {chip.label}
          <button onClick={chip.onRemove} className="ml-0.5 text-brand/50 hover:text-brand" aria-label={`Remove ${chip.label}`}>
            <X className="size-2.5" />
          </button>
        </span>
      ))}
    </div>
  )
}

// ─── Shared toggle chip ───────────────────────────────────────────────────────

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        active
          ? 'border-brand bg-brand text-white'
          : 'border-border bg-surface text-foreground hover:border-brand/40 hover:bg-brand-soft/50',
      )}
    >
      {children}
    </button>
  )
}

// ─── District grid ────────────────────────────────────────────────────────────

function DistrictGrid({ selected, onChange }: { selected: number[]; onChange: (d: number[]) => void }) {
  const toggle = (d: number) =>
    onChange(selected.includes(d) ? selected.filter((x) => x !== d) : [...selected, d])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">District</span>
        {selected.length > 0 && (
          <button onClick={() => onChange([])} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            Clear ({selected.length})
          </button>
        )}
      </div>
      <div className="grid grid-cols-5 gap-1">
        {Object.keys(DISTRICT_NAMES).map((k) => {
          const n = Number(k)
          const isSelected = selected.includes(n)
          return (
            <button
              key={n}
              type="button"
              title={`${n}. ${DISTRICT_NAMES[n]}`}
              onClick={() => toggle(n)}
              className={cn(
                'h-8 w-full rounded-lg text-xs font-medium transition-all',
                isSelected
                  ? 'bg-brand text-white'
                  : 'bg-muted text-muted-foreground hover:bg-brand-soft hover:text-brand',
              )}
            >
              {n}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
          {selected.map((d) => `${d}. ${DISTRICT_NAMES[d]}`).join(' · ')}
        </p>
      )}
    </div>
  )
}

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filters,
  onChange,
  onReset,
  availableProviders,
  availabilityMap,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
  onReset: () => void
  availableProviders: string[]
  availabilityMap: Map<string, AvailabilityStatus>
}) {
  const hasAny = countActiveFilters(filters) > 0
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onChange({ ...filters, [key]: value })

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Filters</span>
        {hasAny && (
          <button onClick={onReset} className="text-xs text-brand hover:underline underline-offset-2 transition-colors">
            Reset all
          </button>
        )}
      </div>

      {/* Availability */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Availability</span>
        <Chip active={filters.availableOnly} onClick={() => set('availableOnly', !filters.availableOnly)}>
          <Zap className="size-3" />
          Available now
        </Chip>
      </div>

      {/* Price range */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Price / month</span>
          <span className="text-xs font-medium text-brand">
            {filters.priceMin > 0 ? `€${filters.priceMin} – ` : 'Up to '}
            {filters.priceMax < 1500 ? `€${filters.priceMax}` : 'any'}
          </span>
        </div>
        <Slider
          min={0}
          max={1500}
          step={50}
          value={[filters.priceMin, filters.priceMax]}
          onValueChange={(vals) => {
            const v = vals as number[]
            onChange({ ...filters, priceMin: v[0], priceMax: v[1] })
          }}
          aria-label="Price range"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>€0</span><span>€1,500+</span>
        </div>
      </div>

      {/* Providers */}
      {availableProviders.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Provider</span>
          <div className="flex flex-wrap gap-1.5">
            {availableProviders.map((p) => (
              <Chip
                key={p}
                active={filters.providers.includes(p)}
                onClick={() =>
                  set('providers', filters.providers.includes(p)
                    ? filters.providers.filter((x) => x !== p)
                    : [...filters.providers, p])
                }
              >
                {p}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Districts */}
      <DistrictGrid
        selected={filters.districts}
        onChange={(d) => set('districts', d)}
      />

      {/* Requirements */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Requirements</span>
        <div className="flex flex-wrap gap-1.5">
          {([['pets', '🐾 Pets'], ['couples', '👫 Couples'], ['furnished', '🛋 Furnished']] as const).map(([key, label]) => (
            <Chip key={key} active={filters[key]} onClick={() => set(key, !filters[key])}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Deposit + stay */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-deposit" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Max deposit
          </Label>
          <div className="flex items-center gap-1">
            <Input
              id="f-deposit"
              type="number"
              min={0}
              value={filters.maxDepositMonths}
              onChange={(e) => set('maxDepositMonths', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Any"
              className="h-8 rounded-lg text-sm"
            />
            <span className="shrink-0 text-[11px] text-muted-foreground">mo</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-stay" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Stay length
          </Label>
          <div className="flex items-center gap-1">
            <Input
              id="f-stay"
              type="number"
              min={1}
              value={filters.stayMonths}
              onChange={(e) => set('stayMonths', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Any"
              className="h-8 rounded-lg text-sm"
            />
            <span className="shrink-0 text-[11px] text-muted-foreground">mo</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DormsPage() {
  const [dorms, setDorms] = useState<Dorm[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [availabilityMap, setAvailabilityMap] = useState<Map<string, AvailabilityStatus>>(new Map())

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('dorms')
      .select('*')
      .eq('active', true)
      .then(({ data, error }) => {
        if (!error && data) {
          const loaded = data as Dorm[]
          setDorms(loaded)
          getAvailabilityStatusBulk(loaded.map((d) => d.id)).then(setAvailabilityMap)
        }
        setLoading(false)
      })
  }, [])

  const availableProviders = useMemo(
    () => Array.from(new Set(dorms.map((d) => d.provider))).sort(),
    [dorms],
  )

  const filtered = useMemo(() => {
    let result = [...dorms]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.provider.toLowerCase().includes(q) ||
          (d.address ?? '').toLowerCase().includes(q),
      )
    }
    if (filters.availableOnly) {
      result = result.filter((d) => availabilityMap.get(d.id)?.status === 'available')
    }
    if (filters.priceMin > 0) {
      result = result.filter((d) => d.price_max == null || d.price_max >= filters.priceMin)
    }
    if (filters.priceMax < 1500) {
      result = result.filter((d) => d.price_min == null || d.price_min <= filters.priceMax)
    }
    if (filters.providers.length > 0) {
      result = result.filter((d) => filters.providers.includes(d.provider))
    }
    if (filters.districts.length > 0) {
      result = result.filter((d) => d.district != null && filters.districts.includes(d.district))
    }
    if (filters.maxDepositMonths !== '') {
      const max = Number(filters.maxDepositMonths)
      result = result.filter((d) => d.deposit_months == null || d.deposit_months <= max)
    }
    if (filters.stayMonths !== '') {
      const months = Number(filters.stayMonths)
      result = result.filter(
        (d) =>
          (d.min_stay_months == null || d.min_stay_months <= months) &&
          (d.max_stay_months == null || d.max_stay_months >= months),
      )
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
  }, [dorms, filters, availabilityMap])

  const activeCount = countActiveFilters(filters)
  const isFiltered = activeCount > 0 || filters.search !== ''
  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const panelProps = {
    filters,
    onChange: setFilters,
    onReset: resetFilters,
    availableProviders,
    availabilityMap,
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div className="flex gap-8 items-start">

          {/* ── Desktop sidebar ── */}
          <aside aria-label="Dorm filters" className="hidden md:block w-[256px] shrink-0">
            <div className="sticky top-[calc(3.5rem+1.5rem)] rounded-2xl border border-border bg-surface px-5 py-5 overflow-y-auto max-h-[calc(100vh-6rem)]">
              <FilterPanel {...panelProps} />
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Top bar */}
            <div className="mb-5">
              <div className="flex items-center gap-2.5 mb-3">
                {/* Results count */}
                <h1 className="flex-1 text-xl font-semibold text-foreground">
                  {loading ? (
                    <Skeleton className="h-6 w-36 rounded-lg inline-block" />
                  ) : isFiltered ? (
                    <span>
                      <span className="text-brand">{filtered.length}</span>
                      <span className="font-normal text-muted-foreground text-base"> of {dorms.length} dorms</span>
                    </span>
                  ) : (
                    <span>
                      <span className="text-brand">{dorms.length}</span>
                      <span className="font-normal text-foreground"> dorms in Vienna</span>
                    </span>
                  )}
                </h1>

                {/* Mobile filter button */}
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full px-3.5 md:hidden" />
                    }
                  >
                    <SlidersHorizontal className="size-3.5" />
                    Filters
                    {activeCount > 0 && (
                      <span className="grid size-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
                        {activeCount}
                      </span>
                    )}
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-0 pt-5">
                    <SheetHeader className="mb-4 flex-row items-center justify-between p-0">
                      <SheetTitle className="text-base">Filter dorms</SheetTitle>
                      <SheetClose render={<Button variant="ghost" size="icon-sm" className="rounded-full" aria-label="Close" />}>
                        <X className="size-4" />
                      </SheetClose>
                    </SheetHeader>
                    <div className="overflow-y-auto max-h-[65vh] pb-2">
                      <FilterPanel {...panelProps} />
                    </div>
                    <div className="sticky bottom-0 bg-surface/95 backdrop-blur-sm border-t border-border py-3">
                      <SheetClose render={<Button size="lg" className="h-11 w-full rounded-full text-sm" />}>
                        {isFiltered ? `Show ${filtered.length} dorm${filtered.length !== 1 ? 's' : ''}` : 'Browse all dorms'}
                      </SheetClose>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Search + sort */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    placeholder="Name, provider, address…"
                    aria-label="Search dorms"
                    className="h-9 rounded-full pl-8 pr-8 text-sm"
                  />
                  {filters.search && (
                    <button
                      onClick={() => setFilters((f) => ({ ...f, search: '' }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <Select value={filters.sort} onValueChange={(v) => setFilters((f) => ({ ...f, sort: v as SortKey }))}>
                  <SelectTrigger className="h-9 w-auto min-w-[155px] rounded-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_asc">Price: low → high</SelectItem>
                    <SelectItem value="price_desc">Price: high → low</SelectItem>
                    <SelectItem value="district_asc">By district</SelectItem>
                    <SelectItem value="created_desc">Recently added</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active chips */}
              {!loading && isFiltered && (
                <div className="mt-3">
                  <FilterChips filters={filters} onChange={setFilters} />
                </div>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <DormCardSkeleton key={i} />)}
              </div>
            )}

            {/* Empty DB */}
            {!loading && dorms.length === 0 && (
              <div className="flex flex-col items-center py-24 text-center">
                <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-muted">
                  <Search className="size-6 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium text-foreground">No dorms listed yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Check back soon — we&apos;re adding new listings.</p>
              </div>
            )}

            {/* No filter match */}
            {!loading && dorms.length > 0 && filtered.length === 0 && (
              <div className="flex flex-col items-center py-24 text-center">
                <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-muted">
                  <SlidersHorizontal className="size-6 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium text-foreground">No dorms match your filters</p>
                <p className="mt-1 mb-5 text-sm text-muted-foreground">Try widening your search criteria</p>
                <Button onClick={resetFilters} className="h-10 rounded-full px-6 text-sm">
                  Reset all filters
                </Button>
              </div>
            )}

            {/* Grid */}
            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((dorm) => (
                  <DormCard
                    key={dorm.id}
                    dorm={dorm}
                    availability={availabilityMap.get(dorm.id) ?? { status: 'unknown', label: 'Status unknown' }}
                    variant="full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
