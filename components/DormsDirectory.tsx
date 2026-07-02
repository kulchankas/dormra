'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Bell, Search, SlidersHorizontal, X } from 'lucide-react'
import {
  DISTRICT_NAMES,
  type AvailabilityStatus,
  type Dorm,
} from '@/lib/helpers'
import {
  DEFAULT_FILTERS,
  applyFilters,
  countActiveFilters,
  filtersToSearchParams,
  parseFiltersFromParams,
  type FilterState,
  type SortKey,
} from '@/lib/dorm-filters'
import DormCard from '@/components/DormCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  DISTRICT_PRESETS,
  districtsMatch,
  toggleDistrictPreset,
} from '@/lib/district-presets'
import { cn } from '@/lib/utils'
import PixelHeroDecor from '@/components/pixel/PixelHeroDecor'

interface Props {
  dorms: Dorm[]
  availability: Record<string, AvailabilityStatus>
}

type QuickFilter = {
  id: string
  label: string
  isActive: (filters: FilterState) => boolean
  toggle: (filters: FilterState) => FilterState
}

const QUICK_FILTERS: QuickFilter[] = [
  {
    id: 'available',
    label: 'Available now',
    isActive: (f) => f.availableOnly,
    toggle: (f) => ({
      ...f,
      availableOnly: !f.availableOnly,
      sort: !f.availableOnly ? 'available_first' : f.sort === 'available_first' ? 'price_asc' : f.sort,
    }),
  },
  {
    id: 'budget500',
    label: 'Under €500',
    isActive: (f) => f.maxPrice === 500,
    toggle: (f) => ({ ...f, maxPrice: f.maxPrice === 500 ? 1500 : 500 }),
  },
  {
    id: 'couples',
    label: 'Couples OK',
    isActive: (f) => f.couples,
    toggle: (f) => ({ ...f, couples: !f.couples }),
  },
]

function FilterChips({
  filters,
  onChange,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
}) {
  const chips: { key: string; label: string; onRemove: () => void }[] = []

  if (filters.search) {
    chips.push({
      key: 'search',
      label: `"${filters.search}"`,
      onRemove: () => onChange({ ...filters, search: '' }),
    })
  }
  if (filters.maxPrice < 1500) {
    chips.push({
      key: 'price',
      label: `≤ €${filters.maxPrice}/mo`,
      onRemove: () => onChange({ ...filters, maxPrice: 1500 }),
    })
  }
  if (filters.availableOnly) {
    chips.push({
      key: 'available',
      label: 'Available now',
      onRemove: () => onChange({ ...filters, availableOnly: false }),
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
  const activePreset = DISTRICT_PRESETS.find((preset) => districtsMatch(filters.districts, preset.districts))
  if (activePreset) {
    chips.push({
      key: `preset-${activePreset.id}`,
      label: activePreset.label,
      onRemove: () => onChange({ ...filters, districts: [] }),
    })
  } else {
    filters.districts.forEach((d) => {
      chips.push({
        key: `dist-${d}`,
        label: `${d}. ${DISTRICT_NAMES[d]}`,
        onRemove: () => onChange({ ...filters, districts: filters.districts.filter((x) => x !== d) }),
      })
    })
  }
  if (filters.pets) chips.push({ key: 'pets', label: 'Pets allowed', onRemove: () => onChange({ ...filters, pets: false }) })
  if (filters.couples) chips.push({ key: 'couples', label: 'Couples allowed', onRemove: () => onChange({ ...filters, couples: false }) })
  if (filters.furnished) chips.push({ key: 'furnished', label: 'Furnished', onRemove: () => onChange({ ...filters, furnished: false }) })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand"
        >
          {chip.label}
          <button
            type="button"
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
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {showReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline transition-colors focus-visible:underline focus-visible:outline-none"
          >
            Reset all
          </button>
        )}
      </div>

      <div className="space-y-2.5 py-4 border-t border-border">
        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox
            checked={filters.availableOnly}
            onCheckedChange={(v) =>
              onChange({
                ...filters,
                availableOnly: !!v,
                sort: v ? 'available_first' : filters.sort === 'available_first' ? 'price_asc' : filters.sort,
              })
            }
          />
          <span className="text-sm text-foreground">Available now only</span>
        </label>
      </div>

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
          <span>Any (€1,500+)</span>
        </div>
      </div>

      {availableProviders.length > 0 && (
        <div className="space-y-2.5 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">Provider</Label>
            {filters.providers.length > 0 && (
              <button
                type="button"
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

      <fieldset className="space-y-2.5 py-4 border-t border-border">
        <div className="flex items-center justify-between">
          <legend className="text-xs font-semibold text-foreground">District</legend>
          {filters.districts.length > 0 && (
            <button
              type="button"
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

export default function DormsDirectory({ dorms, availability }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo(
    () => parseFiltersFromParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  )

  function setFilters(next: FilterState) {
    const qs = filtersToSearchParams(next).toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const availableProviders = useMemo(
    () => Array.from(new Set(dorms.map((d) => d.provider))).sort(),
    [dorms],
  )

  const filtered = useMemo(
    () => applyFilters(dorms, filters, availability),
    [dorms, filters, availability],
  )

  const availableCount = useMemo(
    () => dorms.filter((d) => availability[d.id]?.status === 'available').length,
    [dorms, availability],
  )

  const active =
    countActiveFilters(filters) > 0 || filters.search !== '' || filters.moveIn != null
  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const filterProps = {
    filters,
    onChange: setFilters,
    onReset: resetFilters,
    showReset: active,
    availableProviders,
  }

  const alertHref = (() => {
    const params = new URLSearchParams()
    if (filters.maxPrice < 1500) params.set('maxPrice', String(filters.maxPrice))
    if (filters.districts.length > 0) params.set('districts', filters.districts.join(','))
    if (filters.couples) params.set('couples', '1')
    if (filters.pets) params.set('pets', '1')
    const qs = params.toString()
    return qs ? `/dashboard/alerts/new?${qs}` : '/dashboard/alerts/new'
  })()

  return (
    <main className="min-h-screen bg-background">
      <div className="hero-glow relative border-b border-border/40">
        <PixelHeroDecor />
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Vienna · {dorms.length} listings
                {availableCount > 0 && (
                  <span className="text-brand"> · {availableCount} available now</span>
                )}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Browse student dorms
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Filter by budget, district, and availability across every provider we track.
                Share your search — filters stay in the URL.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              className="h-10 shrink-0 gap-2 rounded-full px-4 text-sm"
              render={<Link href={alertHref} />}
            >
              <Bell className="size-3.5" aria-hidden="true" />
              Set alert for this search
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        {filters.moveIn && (
          <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-border/80 bg-surface-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Move-in by{' '}
              <span className="font-medium text-foreground">
                {format(parseISO(filters.moveIn), 'd MMMM yyyy')}
              </span>
              {' '}— intake-date filtering isn&apos;t live yet. Set an alert and we&apos;ll email you when rooms open.
            </p>
            <Button
              size="sm"
              nativeButton={false}
              className="h-8 shrink-0 rounded-full px-4 text-xs"
              render={<Link href={alertHref} />}
            >
              Create alert
            </Button>
          </div>
        )}

        <div className="flex gap-8 items-start">
          <aside aria-label="Dorm filters" className="hidden md:block w-[260px] shrink-0">
            <div className="card-elevated sticky top-[calc(3.75rem+1.5rem)] rounded-2xl bg-surface px-5 pt-4 pb-5">
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-5 space-y-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {QUICK_FILTERS.map((quick) => {
                    const isActive = quick.isActive(filters)
                    return (
                      <button
                        key={quick.id}
                        type="button"
                        onClick={() => setFilters(quick.toggle(filters))}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                          isActive
                            ? 'bg-brand text-white shadow-sm'
                            : 'bg-surface text-muted-foreground ring-1 ring-border hover:text-foreground',
                        )}
                      >
                        {quick.label}
                      </button>
                    )
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                    Near
                  </span>
                  {DISTRICT_PRESETS.map((preset) => {
                    const isActive = districtsMatch(filters.districts, preset.districts)
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          setFilters({
                            ...filters,
                            districts: toggleDistrictPreset(filters, preset),
                          })
                        }
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                          isActive
                            ? 'bg-brand-soft text-brand ring-1 ring-brand/25'
                            : 'bg-surface text-muted-foreground ring-1 ring-border hover:text-foreground',
                        )}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Search name, provider, address…"
                    aria-label="Search dorms"
                    className="h-10 rounded-full border-border/80 bg-surface pl-9 pr-9 text-sm shadow-sm"
                  />
                  {filters.search && (
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, search: '' })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Select
                    value={filters.sort}
                    onValueChange={(v) => setFilters({ ...filters, sort: v as SortKey })}
                  >
                    <SelectTrigger className="h-10 flex-1 rounded-full text-sm sm:min-w-[168px] sm:flex-none">
                      <SelectValue placeholder="Sort…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available_first">Available first</SelectItem>
                      <SelectItem value="price_asc">Price: low → high</SelectItem>
                      <SelectItem value="price_desc">Price: high → low</SelectItem>
                      <SelectItem value="district_asc">By district</SelectItem>
                      <SelectItem value="created_desc">Recently added</SelectItem>
                    </SelectContent>
                  </Select>

                  <Sheet>
                    <SheetTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 gap-2 rounded-full px-3.5 md:hidden"
                        />
                      }
                    >
                      <SlidersHorizontal className="size-3.5" />
                      <span className="sr-only sm:not-sr-only">Filters</span>
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
              </div>

              <p className="text-sm text-muted-foreground">
                {active ? (
                  <>
                    Showing{' '}
                    <span className="font-medium text-foreground">{filtered.length}</span>
                    {' '}of {dorms.length} dorms
                  </>
                ) : (
                  <>All {dorms.length} dorms · sorted by {filters.sort === 'price_asc' ? 'price' : 'your selection'}</>
                )}
              </p>

              {active && (
                <FilterChips filters={filters} onChange={setFilters} />
              )}
            </div>

            {dorms.length === 0 && (
              <div className="flex flex-col items-center py-24 text-center">
                <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-muted">
                  <Search className="size-6 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium text-foreground">No dorms listed yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Check back soon — we&apos;re adding new listings.</p>
              </div>
            )}

            {dorms.length > 0 && filtered.length === 0 && (
              <div className="flex flex-col items-center py-24 text-center">
                <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-muted">
                  <SlidersHorizontal className="size-6 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium text-foreground">No dorms match your filters</p>
                <p className="mt-1 mb-5 max-w-sm text-sm text-muted-foreground">
                  Try removing a filter or set an alert — we&apos;ll notify you when something opens.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={resetFilters} variant="outline" className="h-10 rounded-full px-6 text-sm">
                    Reset filters
                  </Button>
                  <Button nativeButton={false} className="h-10 rounded-full px-6 text-sm" render={<Link href={alertHref} />}>
                    Set alert instead
                  </Button>
                </div>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((dorm) => (
                  <DormCard
                    key={dorm.id}
                    dorm={dorm}
                    availability={
                      availability[dorm.id] ?? { status: 'unknown', label: 'Status unknown' }
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
