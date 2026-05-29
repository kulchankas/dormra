'use client'

import { useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
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
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'price_asc' | 'price_desc' | 'district_asc' | 'created_desc'

interface FilterState {
  maxPrice: number
  districts: number[]
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
    (f.maxDepositMonths !== '' ? 1 : 0) +
    (f.pets ? 1 : 0) +
    (f.couples ? 1 : 0) +
    (f.furnished ? 1 : 0)
  )
}

// ─── Skeleton grid ────────────────────────────────────────────────────────────

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

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filters,
  onChange,
  onReset,
  showReset,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
  onReset: () => void
  showReset: boolean
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-medium text-foreground">Filters</h2>
        {countActiveFilters(filters) > 0 && (
          <Badge className="h-5 text-xs">{countActiveFilters(filters)}</Badge>
        )}
      </div>

      {/* Max price slider */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Max price:{' '}
          <span className="text-brand">
            {filters.maxPrice < 1500 ? `€${filters.maxPrice}/mo` : 'Any'}
          </span>
        </Label>
        <Slider
          min={200}
          max={1500}
          step={50}
          value={[filters.maxPrice]}
          onValueChange={(vals) => set('maxPrice', Array.isArray(vals) ? (vals as number[])[0] : (vals as number))}
          aria-label="Max monthly price"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>€200</span>
          <span>€1,500+</span>
        </div>
      </div>

      {/* Districts */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Districts</legend>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {Object.entries(DISTRICT_NAMES).map(([k, name]) => {
            const num = Number(k)
            return (
              <label key={num} className="flex cursor-pointer items-start gap-1.5 text-xs leading-tight text-muted-foreground">
                <Checkbox
                  checked={filters.districts.includes(num)}
                  onCheckedChange={() => toggleDistrict(num)}
                  className="mt-0.5 shrink-0"
                />
                <span>{num} — {name}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {/* Max deposit */}
      <div className="space-y-1.5">
        <Label htmlFor="filter-deposit" className="text-sm font-medium">Max deposit (months)</Label>
        <Input
          id="filter-deposit"
          type="number"
          min={0}
          value={filters.maxDepositMonths}
          onChange={(e) =>
            set('maxDepositMonths', e.target.value === '' ? '' : Number(e.target.value))
          }
          placeholder="e.g. 2"
          className="h-9 rounded-lg"
        />
      </div>

      {/* Amenities */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Amenities</legend>
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
              className="size-4"
            />
            <span className="text-sm text-foreground">{label}</span>
          </label>
        ))}
      </fieldset>

      {showReset && (
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          Reset all filters
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

  const filterProps = { filters, onChange: setFilters, onReset: resetFilters, showReset: active }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex gap-8 items-start">
          {/* Desktop sidebar */}
          <aside aria-label="Dorm filters" className="hidden md:block w-[280px] shrink-0">
            <div className="sticky top-[calc(3.5rem+1.5rem)] rounded-2xl border border-border bg-surface p-5">
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-xl font-medium text-foreground flex-1">
                  {loading ? (
                    'Loading dorms…'
                  ) : active ? (
                    <>Showing <span className="text-brand-accent">{filtered.length}</span> of {dorms.length} dorms</>
                  ) : (
                    <><span className="text-brand-accent">{dorms.length}</span> dorms in Vienna</>
                  )}
                </h1>

                {/* Mobile filter trigger */}
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 rounded-full px-3 md:hidden"
                      />
                    }
                  >
                    <SlidersHorizontal className="size-3.5" />
                    Filters
                    {countActiveFilters(filters) > 0 && (
                      <Badge className="h-4 min-w-4 text-[10px]">{countActiveFilters(filters)}</Badge>
                    )}
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-10 pt-5">
                    <SheetHeader className="mb-4 p-0">
                      <SheetTitle>Filter dorms</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-y-auto max-h-[70vh]">
                      <FilterPanel {...filterProps} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Search + sort row */}
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[160px]">
                  <Input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    placeholder="Search by name…"
                    aria-label="Search dorms by name"
                    className="h-9 rounded-full pl-4"
                  />
                </div>

                <Select
                  value={filters.sort}
                  onValueChange={(v) => setFilters((f) => ({ ...f, sort: v as SortKey }))}
                >
                  <SelectTrigger className="h-9 w-auto min-w-[170px] rounded-full">
                    <SelectValue placeholder="Sort by…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_asc">Price (low to high)</SelectItem>
                    <SelectItem value="price_desc">Price (high to low)</SelectItem>
                    <SelectItem value="district_asc">District</SelectItem>
                    <SelectItem value="created_desc">Recently added</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <DormCardSkeleton key={i} />)}
              </div>
            )}

            {/* Empty DB */}
            {!loading && dorms.length === 0 && (
              <div className="py-24 text-center">
                <p className="text-lg font-medium text-foreground mb-2">No dorms found</p>
                <p className="text-sm text-muted-foreground">Check back soon — we&apos;re adding new listings.</p>
              </div>
            )}

            {/* Filter mismatch */}
            {!loading && dorms.length > 0 && filtered.length === 0 && (
              <div className="py-24 text-center">
                <p className="text-lg font-medium text-foreground mb-2">No dorms match your filters</p>
                <p className="text-sm text-muted-foreground mb-6">Try widening your search</p>
                <Button onClick={resetFilters} className="h-10 rounded-full px-6">Reset filters</Button>
              </div>
            )}

            {/* Cards */}
            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
