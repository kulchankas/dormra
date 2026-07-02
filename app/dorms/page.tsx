'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
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
  maxPrice: number
  districts: number[]
  providers: string[]
  maxDepositMonths: number | ''
  pets: boolean
  couples: boolean
  furnished: boolean
  search: string
  sort: SortKey
}

const DEFAULT_FILTERS: FilterState = {
  maxPrice: 1500,
  districts: [],
  providers: [],
  maxDepositMonths: '',
  pets: false,
  couples: false,
  furnished: false,
  search: '',
  sort: 'price_asc',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countActiveFilters(f: FilterState): number {
  return (
    (f.maxPrice < 1500 ? 1 : 0) +
    (f.districts.length > 0 ? 1 : 0) +
    (f.providers.length > 0 ? 1 : 0) +
    (f.maxDepositMonths !== '' ? 1 : 0) +
    (f.pets ? 1 : 0) +
    (f.couples ? 1 : 0) +
    (f.furnished ? 1 : 0)
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

  if (filters.maxPrice < 1500) {
    chips.push({
      key: 'price',
      label: `≤ €${filters.maxPrice}/mo`,
      onRemove: () => onChange({ ...filters, maxPrice: 1500 }),
    })
  }
  if (filters.maxDepositMonths !== '') {
    chips.push({
      key: 'deposit',
      label: `Deposit ≤ ${filters.maxDepositMonths} mo`,
      onRemove: () => onChange({ ...filters, maxDepositMonths: '' }),
    })
  }
  filters.providers.forEach((p) => {
    chips.push({
      key: `prov-${p}`,
      label: p,
      onRemove: () => onChange({ ...filters, providers: filters.providers.filter((x) => x !== p) }),
    })
  })
  filters.districts.forEach((d) => {
    chips.push({
      key: `dist-${d}`,
      label: `${d}. ${DISTRICT_NAMES[d]}`,
      onRemove: () => onChange({ ...filters, districts: filters.districts.filter((x) => x !== d) }),
    })
  })
  if (filters.pets) chips.push({ key: 'pets', label: 'Pets allowed', onRemove: () => onChange({ ...filters, pets: false }) })
  if (filters.couples) chips.push({ key: 'couples', label: 'Couples allowed', onRemove: () => onChange({ ...filters, couples: false }) })
  if (filters.furnished) chips.push({ key: 'furnished', label: 'Furnished', onRemove: () => onChange({ ...filters, furnished: false }) })

  if (chips.length === 0) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="ml-0.5 rounded-full text-brand/50 hover:text-brand transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  )
}

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filters,
  onChange,
  onReset,
  showReset,
  availableProviders,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
  onReset: () => void
  showReset: boolean
  availableProviders: string[]
}) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onChange({ ...filters, [key]: value })

  const toggleDistrict = (d: number) =>
    set(
      'districts',
      filters.districts.includes(d)
        ? filters.districts.filter((x) => x !== d)
        : [...filters.districts, d],
    )

  const toggleProvider = (p: string) =>
    set(
      'providers',
      filters.providers.includes(p)
        ? filters.providers.filter((x) => x !== p)
        : [...filters.providers, p],
    )

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {showReset && (
          <button
            onClick={onReset}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline transition-colors focus-visible:underline focus-visible:outline-none"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Max price */}
      <div className="space-y-3 py-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground">Max rent</Label>
          <span className="text-xs font-medium text-brand">
            {filters.maxPrice < 1500 ? `€${filters.maxPrice}/mo` : 'Any'}
          </span>
        </div>
        <Slider
          min={200}
          max={1500}
          step={50}
          value={[filters.maxPrice]}
          onValueChange={(vals) =>
            set('maxPrice', Array.isArray(vals) ? (vals as number[])[0] : (vals as number))
          }
          aria-label="Max monthly price"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>€200</span>
          <span>€1,500+</span>
        </div>
      </div>

      {/* Providers */}
      {availableProviders.length > 0 && (
        <div className="space-y-2.5 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">Provider</Label>
            {filters.providers.length > 0 && (
              <button
                onClick={() => set('providers', [])}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-2">
            {availableProviders.map((p) => (
              <label key={p} className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={filters.providers.includes(p)}
                  onCheckedChange={() => toggleProvider(p)}
                  className="shrink-0"
                />
                <span className="text-sm text-foreground leading-tight">{p}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Districts */}
      <fieldset className="space-y-2.5 py-4 border-t border-border">
        <div className="flex items-center justify-between">
          <legend className="text-xs font-semibold text-foreground">District</legend>
          {filters.districts.length > 0 && (
            <button
              onClick={() => set('districts', [])}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear ({filters.districts.length})
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 max-h-52 overflow-y-auto pr-1">
          {Object.entries(DISTRICT_NAMES).map(([k, name]) => {
            const num = Number(k)
            return (
              <label
                key={num}
                className="flex cursor-pointer items-start gap-1.5 text-xs leading-snug text-muted-foreground hover:text-foreground transition-colors"
              >
                <Checkbox
                  checked={filters.districts.includes(num)}
                  onCheckedChange={() => toggleDistrict(num)}
                  className="mt-0.5 shrink-0"
                />
                <span>{num}. {name}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* Max deposit */}
      <div className="space-y-2 py-4 border-t border-border">
        <Label htmlFor="filter-deposit" className="text-xs font-semibold text-foreground">
          Max deposit
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="filter-deposit"
            type="number"
            min={0}
            value={filters.maxDepositMonths}
            onChange={(e) =>
              set('maxDepositMonths', e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder="e.g. 2"
            className="h-8 rounded-lg text-sm"
          />
          <span className="shrink-0 text-xs text-muted-foreground">months</span>
        </div>
      </div>

      {/* Amenities */}
      <fieldset className="space-y-2.5 py-4 border-t border-border">
        <legend className="text-xs font-semibold text-foreground mb-2.5">Requirements</legend>
        {(
          [
            ['pets', 'Pets allowed'],
            ['couples', 'Couples allowed'],
            ['furnished', 'Furnished'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={filters[key]}
              onCheckedChange={(v) => set(key, !!v)}
            />
            <span className="text-sm text-foreground">{label}</span>
          </label>
        ))}
      </fieldset>
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
    if (filters.maxPrice < 1500) {
      result = result.filter((d) => d.price_min == null || d.price_min <= filters.maxPrice)
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

  const active = countActiveFilters(filters) > 0 || filters.search !== ''
  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const filterProps = {
    filters,
    onChange: setFilters,
    onReset: resetFilters,
    showReset: active,
    availableProviders,
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div className="flex gap-8 items-start">

          {/* ── Desktop sidebar ── */}
          <aside aria-label="Dorm filters" className="hidden md:block w-[260px] shrink-0">
            <div className="sticky top-[calc(3.5rem+1.5rem)] rounded-2xl border border-border bg-surface px-5 pt-4 pb-5">
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Results header */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-3">
                {/* Title */}
                <h1 className="flex-1 text-xl font-semibold text-foreground leading-tight">
                  {loading ? (
                    <Skeleton className="h-6 w-40 rounded-lg" />
                  ) : active ? (
                    <span>
                      <span className="text-brand">{filtered.length}</span>
                      <span className="text-muted-foreground font-normal"> of {dorms.length} dorms</span>
                    </span>
                  ) : (
                    <span>
                      <span className="text-brand">{dorms.length}</span>
                      <span className="font-normal text-foreground"> dorms in Vienna</span>
                    </span>
                  )}
                </h1>

                {/* Mobile filter trigger */}
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 rounded-full px-3.5 md:hidden"
                      />
                    }
                  >
                    <SlidersHorizontal className="size-3.5" />
                    Filters
                    {countActiveFilters(filters) > 0 && (
                      <span className="grid size-4 place-items-center rounded-full bg-brand text-[10px] font-semibold text-white">
                        {countActiveFilters(filters)}
                      </span>
                    )}
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-0 pt-5">
                    <SheetHeader className="mb-1 flex-row items-center justify-between p-0">
                      <SheetTitle className="text-base">Filter dorms</SheetTitle>
                      <SheetClose
                        render={
                          <Button variant="ghost" size="icon-sm" className="rounded-full" aria-label="Close filters" />
                        }
                      >
                        <X className="size-4" />
                      </SheetClose>
                    </SheetHeader>
                    <div className="overflow-y-auto max-h-[70vh] pb-2">
                      <FilterPanel {...filterProps} />
                    </div>
                    {/* Sticky apply button */}
                    <div className="sticky bottom-0 bg-surface/95 backdrop-blur-sm border-t border-border py-3">
                      <SheetClose
                        render={
                          <Button size="lg" className="h-11 w-full rounded-full text-sm" />
                        }
                      >
                        {active
                          ? `Show ${filtered.length} dorm${filtered.length !== 1 ? 's' : ''}`
                          : 'Browse all dorms'}
                      </SheetClose>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Search + sort */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    placeholder="Search by name, provider…"
                    aria-label="Search dorms"
                    className="h-9 rounded-full pl-8 pr-4 text-sm"
                  />
                  {filters.search && (
                    <button
                      onClick={() => setFilters((f) => ({ ...f, search: '' }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <Select
                  value={filters.sort}
                  onValueChange={(v) => setFilters((f) => ({ ...f, sort: v as SortKey }))}
                >
                  <SelectTrigger className="h-9 w-auto min-w-[160px] rounded-full text-sm">
                    <SelectValue placeholder="Sort…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_asc">Price: low → high</SelectItem>
                    <SelectItem value="price_desc">Price: high → low</SelectItem>
                    <SelectItem value="district_asc">By district</SelectItem>
                    <SelectItem value="created_desc">Recently added</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active filter chips */}
              {!loading && active && (
                <div className="mt-3">
                  <FilterChips filters={filters} onChange={setFilters} />
                </div>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

            {/* Filter mismatch */}
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

            {/* Cards */}
            {!loading && filtered.length > 0 && (
              <div className={cn(
                'grid gap-4',
                'grid-cols-1 sm:grid-cols-2',
                // On xl, 3 cols only if sidebar is hidden (mobile). On desktop sidebar takes space so 2 cols is fine, 3 on very wide
                'xl:grid-cols-3',
              )}>
                {filtered.map((dorm) => (
                  <DormCard
                    key={dorm.id}
                    dorm={dorm}
                    availability={
                      availabilityMap.get(dorm.id) ?? { status: 'unknown', label: 'Status unknown' }
                    }
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
