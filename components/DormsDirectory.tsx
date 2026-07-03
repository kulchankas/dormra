'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { Bell, Loader2, Map as MapIcon, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import {
  DISTRICT_NAMES,
  type AvailabilityStatus,
  type Dorm,
} from '@/lib/helpers'
import type { DormRatingSummary } from '@/lib/dorm-reviews'
import {
  DEFAULT_FILTERS,
  MAX_PRICE_CEILING,
  MIN_PRICE_FLOOR,
  applyFilters,
  countActiveFilters,
  filtersToSearchParams,
  haversineDistanceKm,
  parseFiltersFromParams,
  type FilterState,
  type SortKey,
} from '@/lib/dorm-filters'
import DormCard from '@/components/DormCard'
import { Skeleton } from '@/components/ui/skeleton'
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

const DormsMap = dynamic(() => import('@/components/DormsMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-[60vh] w-full rounded-2xl md:h-[70vh]" />,
})

interface Props {
  dorms: Dorm[]
  availability: Record<string, AvailabilityStatus>
  /** Dorm IDs the signed-in viewer has saved. Omitted entirely for signed-out
   * visitors, in which case the save toggle isn't rendered on cards. */
  savedDormIds?: string[]
  /** Aggregate Grapevine ratings per dorm ID, bulk-fetched like `availability`. */
  ratingSummaries?: Record<string, DormRatingSummary>
}

function MapLegend({ className }: { className?: string }) {
  const t = useTranslations('dorms')
  const tAvail = useTranslations('availability')
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground', className)}>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-2.5 rounded-full bg-brand-accent" />
        {tAvail('available')}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-2.5 rounded-full bg-foreground/80" />
        {tAvail('fullyBooked')}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-2.5 rounded-full bg-muted-foreground/40" />
        {tAvail('unknown')}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true">🎓</span>
        {t('mapUniversityLegend')}
      </span>
    </div>
  )
}

type QuickFilter = {
  id: string
  label: string
  isActive: (filters: FilterState) => boolean
  toggle: (filters: FilterState) => FilterState
}

const PRESET_LABEL_KEYS = {
  tu: 'presetTu',
  uni: 'presetUni',
  wu: 'presetWu',
  boku: 'presetBoku',
  meduni: 'presetMeduni',
} as const

function FilterChips({
  filters,
  onChange,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
}) {
  const t = useTranslations('dorms')
  const chips: { key: string; label: string; onRemove: () => void }[] = []

  if (filters.search) {
    chips.push({
      key: 'search',
      label: `"${filters.search}"`,
      onRemove: () => onChange({ ...filters, search: '' }),
    })
  }
  if (filters.minPrice > MIN_PRICE_FLOOR || filters.maxPrice < MAX_PRICE_CEILING) {
    const maxLabel = filters.maxPrice < MAX_PRICE_CEILING ? `€${filters.maxPrice}` : `€${MAX_PRICE_CEILING}+`
    chips.push({
      key: 'price',
      label: `€${filters.minPrice}–${maxLabel}/mo`,
      onRemove: () => onChange({ ...filters, minPrice: MIN_PRICE_FLOOR, maxPrice: MAX_PRICE_CEILING }),
    })
  }
  if (filters.shortStayOk) {
    chips.push({
      key: 'shortStay',
      label: t('shortStayOk'),
      onRemove: () => onChange({ ...filters, shortStayOk: false }),
    })
  }
  if (filters.availableOnly) {
    chips.push({
      key: 'available',
      label: t('presetsAvailable'),
      onRemove: () => onChange({ ...filters, availableOnly: false }),
    })
  }
  if (filters.maxDepositMonths !== '') {
    chips.push({
      key: 'deposit',
      label: t('depositChip', { months: filters.maxDepositMonths }),
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
      label: t(PRESET_LABEL_KEYS[activePreset.id as keyof typeof PRESET_LABEL_KEYS]),
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
  if (filters.pets) chips.push({ key: 'pets', label: t('petsAllowed'), onRemove: () => onChange({ ...filters, pets: false }) })
  if (filters.couples) chips.push({ key: 'couples', label: t('couplesAllowed'), onRemove: () => onChange({ ...filters, couples: false }) })
  if (filters.furnished) chips.push({ key: 'furnished', label: t('furnished'), onRemove: () => onChange({ ...filters, furnished: false }) })

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
            className="relative ml-0.5 rounded-full text-brand/50 hover:text-brand transition-colors after:absolute after:-inset-1.5"
            aria-label={t('removeFilter', { label: chip.label })}
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
  const t = useTranslations('dorms')
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
        <h2 className="text-sm font-semibold text-foreground">{t('filters')}</h2>
        {showReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline transition-colors focus-visible:underline focus-visible:outline-none"
          >
            {t('resetAll')}
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
          <span className="text-sm text-foreground">{t('availableOnly')}</span>
        </label>
      </div>

      <div className="space-y-3 py-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground">{t('rentRange')}</Label>
          <span className="text-xs font-medium text-brand">
            {filters.minPrice > MIN_PRICE_FLOOR || filters.maxPrice < MAX_PRICE_CEILING
              ? `€${filters.minPrice}–${filters.maxPrice < MAX_PRICE_CEILING ? `€${filters.maxPrice}` : `€${MAX_PRICE_CEILING}+`}`
              : t('any')}
          </span>
        </div>
        <Slider
          min={MIN_PRICE_FLOOR}
          max={MAX_PRICE_CEILING}
          step={50}
          value={[filters.minPrice, filters.maxPrice]}
          onValueChange={(vals) => {
            const [min, max] = vals as number[]
            onChange({ ...filters, minPrice: min, maxPrice: max })
          }}
          aria-label={t('rentRangeAria')}
        />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>€{MIN_PRICE_FLOOR}</span>
          <span>{t('anyRent')}</span>
        </div>
      </div>

      {availableProviders.length > 0 && (
        <div className="space-y-2.5 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">{t('provider')}</Label>
            {filters.providers.length > 0 && (
              <button
                type="button"
                onClick={() => set('providers', [])}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('clear')}
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
          <legend className="text-xs font-semibold text-foreground">{t('district')}</legend>
          {filters.districts.length > 0 && (
            <button
              type="button"
              onClick={() => set('districts', [])}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('clearCount', { count: filters.districts.length })}
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
          {t('maxDeposit')}
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
            placeholder={t('depositPlaceholder')}
            className="h-8 rounded-lg text-sm"
          />
          <span className="shrink-0 text-xs text-muted-foreground">{t('monthsShort')}</span>
        </div>
      </div>

      <fieldset className="space-y-2.5 py-4 border-t border-border">
        <legend className="text-xs font-semibold text-foreground mb-2.5">{t('requirements')}</legend>
        {(
          [
            ['pets', 'petsAllowed'],
            ['couples', 'couplesAllowed'],
            ['furnished', 'furnished'],
            ['shortStayOk', 'shortStayOk'],
          ] as const
        ).map(([key, labelKey]) => (
          <label key={key} className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={filters[key]}
              onCheckedChange={(v) => set(key, !!v)}
            />
            <span className="text-sm text-foreground">{t(labelKey)}</span>
          </label>
        ))}
      </fieldset>
    </div>
  )
}

export default function DormsDirectory({ dorms, availability, savedDormIds, ratingSummaries }: Props) {
  const savedSet = useMemo(() => new Set(savedDormIds ?? []), [savedDormIds])
  const t = useTranslations('dorms')
  const tAvail = useTranslations('availability')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Map is a persistent sticky side-column on wide screens (xl+), always
  // visible by default rather than hidden behind a tab — this can be
  // collapsed back to a full-width list via the "Hide map" toggle. Below
  // that breakpoint there isn't room for a side-by-side column, so a
  // floating button opens the map in a fullscreen sheet instead.
  const [desktopMapOpen, setDesktopMapOpen] = useState(true)
  const [mobileMapOpen, setMobileMapOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)

  const sortLabels: Record<SortKey, string> = {
    available_first: t('availableFirst'),
    price_asc: t('sortPriceLow'),
    price_desc: t('sortPriceHigh'),
    district_asc: t('sortDistrict'),
    created_desc: t('sortRecent'),
    distance: t('sortDistance'),
  }

  const quickFilters: QuickFilter[] = [
    {
      id: 'available',
      label: t('presetsAvailable'),
      isActive: (f) => f.availableOnly,
      toggle: (f) => ({
        ...f,
        availableOnly: !f.availableOnly,
        sort: !f.availableOnly ? 'available_first' : f.sort === 'available_first' ? 'price_asc' : f.sort,
      }),
    },
    {
      id: 'budget500',
      label: t('presetsUnder500'),
      isActive: (f) => f.maxPrice === 500,
      toggle: (f) => ({ ...f, maxPrice: f.maxPrice === 500 ? 1500 : 500 }),
    },
    {
      id: 'couples',
      label: t('presetsCouples'),
      isActive: (f) => f.couples,
      toggle: (f) => ({ ...f, couples: !f.couples }),
    },
  ]

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

  const distanceById = useMemo(() => {
    if (!userLocation) return {}
    const map: Record<string, number> = {}
    for (const d of dorms) {
      if (d.lat != null && d.lng != null) {
        map[d.id] = haversineDistanceKm(userLocation, { lat: d.lat, lng: d.lng })
      }
    }
    return map
  }, [dorms, userLocation])

  const filtered = useMemo(
    () => applyFilters(dorms, filters, availability, distanceById),
    [dorms, filters, availability, distanceById],
  )

  const availableCount = useMemo(
    () => dorms.filter((d) => availability[d.id]?.status === 'available').length,
    [dorms, availability],
  )

  function handleNearMe() {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      toast.error(t('locationUnsupported'))
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
        setFilters({ ...filters, sort: 'distance' })
      },
      () => {
        setLocating(false)
        toast.error(t('locationDenied'))
      },
      { timeout: 10000 },
    )
  }

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
      <div className="hero-glow border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('viennaListings', { count: dorms.length })}
                {availableCount > 0 && (
                  <span className="text-brand">{t('availableCount', { count: availableCount })}</span>
                )}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {t('title')}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {t('subtitle')} {t('shareSearch')}
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
              {t('setAlertForSearch')}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        {filters.moveIn && (
          <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-border/80 bg-surface-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {t('moveInBanner', {
                date: format(parseISO(filters.moveIn!), 'd MMMM yyyy'),
              })}
            </p>
            <Button
              size="sm"
              nativeButton={false}
              className="h-8 shrink-0 rounded-full px-4 text-xs"
              render={<Link href={alertHref} />}
            >
              {t('createAlert')}
            </Button>
          </div>
        )}

        <div className="flex gap-8 items-start">
          <aside aria-label={t('filtersAria')} className="hidden md:block w-[260px] shrink-0">
            <div className="card-elevated sticky top-[calc(3.75rem+1.5rem)] rounded-2xl bg-surface px-5 pt-4 pb-5">
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-5 space-y-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {quickFilters.map((quick) => {
                    const isActive = quick.isActive(filters)
                    return (
                      <button
                        key={quick.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setFilters(quick.toggle(filters))}
                        className={cn(
                          'relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors after:absolute after:-inset-y-1.5 after:inset-x-0',
                          isActive
                            ? 'bg-brand text-white shadow-sm'
                            : 'bg-surface text-muted-foreground ring-1 ring-border hover:text-foreground',
                        )}
                      >
                        {quick.label}
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={handleNearMe}
                    disabled={locating}
                    aria-pressed={!!userLocation && filters.sort === 'distance'}
                    className={cn(
                      'relative inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors after:absolute after:-inset-y-1.5 after:inset-x-0 disabled:opacity-70',
                      userLocation && filters.sort === 'distance'
                        ? 'bg-brand text-white shadow-sm'
                        : 'bg-surface text-muted-foreground ring-1 ring-border hover:text-foreground',
                    )}
                  >
                    {locating ? (
                      <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                    ) : (
                      <MapPin className="size-3" aria-hidden="true" />
                    )}
                    {locating ? t('locating') : t('nearMe')}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                    {t('near')}
                  </span>
                  {DISTRICT_PRESETS.map((preset) => {
                    const isActive = districtsMatch(filters.districts, preset.districts)
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() =>
                          setFilters({
                            ...filters,
                            districts: toggleDistrictPreset(filters, preset),
                          })
                        }
                        className={cn(
                          'relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors after:absolute after:-inset-y-1.5 after:inset-x-0',
                          isActive
                            ? 'bg-brand-soft text-brand ring-1 ring-brand/25'
                            : 'bg-surface text-muted-foreground ring-1 ring-border hover:text-foreground',
                        )}
                      >
                        {t(PRESET_LABEL_KEYS[preset.id as keyof typeof PRESET_LABEL_KEYS])}
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
                    placeholder={t('searchPlaceholder')}
                    aria-label={t('searchAria')}
                    className="h-10 rounded-full border-border/80 bg-surface pl-9 pr-9 text-sm shadow-sm"
                  />
                  {filters.search && (
                    <button
                      type="button"
                      onClick={() => setFilters({ ...filters, search: '' })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={t('clearSearch')}
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
                      {/* Base UI's Select.Value renders the raw value by default — it
                          needs a lookup (via `items` on Select.Root or a function child
                          here) to show the translated label instead of e.g. "price_asc". */}
                      <SelectValue placeholder={t('sortPlaceholder')}>
                        {(value: unknown) => sortLabels[value as SortKey] ?? t('sortPlaceholder')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {userLocation && <SelectItem value="distance">{t('sortDistance')}</SelectItem>}
                      <SelectItem value="available_first">{t('availableFirst')}</SelectItem>
                      <SelectItem value="price_asc">{t('sortPriceLow')}</SelectItem>
                      <SelectItem value="price_desc">{t('sortPriceHigh')}</SelectItem>
                      <SelectItem value="district_asc">{t('sortDistrict')}</SelectItem>
                      <SelectItem value="created_desc">{t('sortRecent')}</SelectItem>
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
                      <span className="sr-only sm:not-sr-only">{t('mobileFilters')}</span>
                      {countActiveFilters(filters) > 0 && (
                        <span className="grid size-4 place-items-center rounded-full bg-brand text-[10px] font-semibold text-white">
                          {countActiveFilters(filters)}
                        </span>
                      )}
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-3xl px-5 pb-0 pt-5">
                      <SheetHeader className="mb-1 flex-row items-center justify-between p-0">
                        <SheetTitle className="text-base">{t('filterDorms')}</SheetTitle>
                        <SheetClose
                          render={
                            <Button variant="ghost" size="icon-sm" className="rounded-full" aria-label={t('closeFilters')} />
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
                            ? filtered.length === 1
                              ? t('showCount', { count: filtered.length })
                              : t('showCountPlural', { count: filtered.length })
                            : t('browseAll')}
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {active ? (
                    t('showingOf', { filtered: filtered.length, total: dorms.length })
                  ) : (
                    t('allSorted', {
                      total: dorms.length,
                      sort: sortLabels[filters.sort],
                    })
                  )}
                </p>

                {filtered.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDesktopMapOpen((v) => !v)}
                    aria-pressed={desktopMapOpen}
                    className="hidden shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/70 xl:inline-flex"
                  >
                    <MapIcon className="size-3.5" aria-hidden="true" />
                    {desktopMapOpen ? t('hideMap') : t('showMap')}
                  </button>
                )}
              </div>

              {active && (
                <FilterChips filters={filters} onChange={setFilters} />
              )}
            </div>

            <div className="xl:flex xl:items-start xl:gap-5">
              <div className="min-w-0 xl:flex-1">
                {dorms.length === 0 && (
                  <div className="flex flex-col items-center py-24 text-center">
                    <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-muted">
                      <Search className="size-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-base font-medium text-foreground">{t('noListingsYet')}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t('noListingsHint')}</p>
                  </div>
                )}

                {dorms.length > 0 && filtered.length === 0 && (
                  <div className="flex flex-col items-center py-24 text-center">
                    <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-muted">
                      <SlidersHorizontal className="size-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-base font-medium text-foreground">{t('noResults')}</p>
                    <p className="mt-1 mb-5 max-w-sm text-sm text-muted-foreground">
                      {t('noMatchExtended')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button onClick={resetFilters} variant="outline" className="h-10 rounded-full px-6 text-sm">
                        {t('resetFilters')}
                      </Button>
                      <Button nativeButton={false} className="h-10 rounded-full px-6 text-sm" render={<Link href={alertHref} />}>
                        {t('setAlertInstead')}
                      </Button>
                    </div>
                  </div>
                )}

                {filtered.length > 0 && (
                  <div
                    className={cn(
                      'grid grid-cols-1 gap-4 sm:grid-cols-2',
                      desktopMapOpen ? 'xl:grid-cols-2 2xl:grid-cols-3' : 'xl:grid-cols-3',
                    )}
                  >
                    {filtered.map((dorm) => (
                      <DormCard
                        key={dorm.id}
                        dorm={dorm}
                        availability={
                          availability[dorm.id] ?? {
                            status: 'unknown',
                            label: tAvail('unknown'),
                          }
                        }
                        variant="full"
                        showSaveButton={savedDormIds != null}
                        initialSaved={savedSet.has(dorm.id)}
                        ratingSummary={ratingSummaries?.[dorm.id]}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Persistent side-by-side map on wide screens — always visible
                  by default (desktopMapOpen starts true) instead of hidden
                  behind a tab, per the "map isn't visible enough" feedback. */}
              {filtered.length > 0 && desktopMapOpen && (
                <div className="hidden xl:sticky xl:top-[calc(3.75rem+1.5rem)] xl:block xl:w-[380px] xl:shrink-0 2xl:w-[420px]">
                  <div className="space-y-2">
                    <DormsMap
                      dorms={filtered}
                      availability={availability}
                      userLocation={userLocation}
                      heightClassName="h-[calc(100vh-8rem)]"
                    />
                    <MapLegend className="px-1" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Below xl, there's no room for a side-by-side map — a persistent
          floating button opens it fullscreen instead, so it's always
          reachable rather than buried in a toolbar that can scroll away. */}
      {filtered.length > 0 && (
        <button
          type="button"
          onClick={() => setMobileMapOpen(true)}
          className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg transition-transform hover:scale-105 xl:hidden"
        >
          <MapIcon className="size-4" aria-hidden="true" />
          {t('mapView')}
        </button>
      )}

      <Sheet open={mobileMapOpen} onOpenChange={setMobileMapOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="rounded-none p-0 data-[side=bottom]:h-[100dvh] xl:hidden"
        >
          <div className="flex h-full flex-col">
            <SheetHeader className="flex-row items-center justify-between border-b border-border p-3">
              <SheetTitle className="text-base">{t('mapView')}</SheetTitle>
              <SheetClose
                render={
                  <Button variant="ghost" size="icon-sm" className="rounded-full" aria-label={t('closeMap')} />
                }
              >
                <X className="size-4" />
              </SheetClose>
            </SheetHeader>
            <div className="min-h-0 flex-1 p-3">
              <DormsMap
                dorms={filtered}
                availability={availability}
                userLocation={userLocation}
                heightClassName="h-full"
              />
            </div>
            <MapLegend className="border-t border-border p-3" />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
