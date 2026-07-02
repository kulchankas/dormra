import type { Dorm } from './helpers'
import type { AvailabilityStatus } from './availability'

export type SortKey = 'price_asc' | 'price_desc' | 'district_asc' | 'created_desc' | 'available_first'

export interface FilterState {
  maxPrice: number
  districts: number[]
  providers: string[]
  maxDepositMonths: number | ''
  pets: boolean
  couples: boolean
  furnished: boolean
  availableOnly: boolean
  search: string
  sort: SortKey
  /** From homepage hero — display only until move-in matching ships */
  moveIn: string | null
}

export const DEFAULT_FILTERS: FilterState = {
  maxPrice: 1500,
  districts: [],
  providers: [],
  maxDepositMonths: '',
  pets: false,
  couples: false,
  furnished: false,
  availableOnly: false,
  search: '',
  sort: 'price_asc',
  moveIn: null,
}

export function countActiveFilters(f: FilterState): number {
  return (
    (f.maxPrice < 1500 ? 1 : 0) +
    (f.districts.length > 0 ? 1 : 0) +
    (f.providers.length > 0 ? 1 : 0) +
    (f.maxDepositMonths !== '' ? 1 : 0) +
    (f.pets ? 1 : 0) +
    (f.couples ? 1 : 0) +
    (f.furnished ? 1 : 0) +
    (f.availableOnly ? 1 : 0)
  )
}

export function parseFiltersFromParams(
  params: Record<string, string | string[] | undefined>,
): FilterState {
  const filters = { ...DEFAULT_FILTERS }

  const maxPrice = paramValue(params.maxPrice)
  if (maxPrice && !Number.isNaN(Number(maxPrice))) {
    filters.maxPrice = Number(maxPrice)
  }

  const search = paramValue(params.q)
  if (search) filters.search = search

  const sort = paramValue(params.sort)
  if (sort && isSortKey(sort)) filters.sort = sort

  const districts = paramValue(params.districts)
  if (districts) {
    filters.districts = districts
      .split(',')
      .map(Number)
      .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 23)
  }

  const providers = paramValue(params.providers)
  if (providers) {
    filters.providers = providers.split(',').filter(Boolean)
  }

  const maxDeposit = paramValue(params.maxDeposit)
  if (maxDeposit && !Number.isNaN(Number(maxDeposit))) {
    filters.maxDepositMonths = Number(maxDeposit)
  }

  if (paramValue(params.pets) === '1') filters.pets = true
  if (paramValue(params.couples) === '1') filters.couples = true
  if (paramValue(params.furnished) === '1') filters.furnished = true
  if (paramValue(params.available) === '1') filters.availableOnly = true

  const moveIn = paramValue(params.moveIn)
  if (moveIn && /^\d{4}-\d{2}-\d{2}$/.test(moveIn)) filters.moveIn = moveIn

  return filters
}

export function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.maxPrice < 1500) params.set('maxPrice', String(filters.maxPrice))
  if (filters.search) params.set('q', filters.search)
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort)
  if (filters.districts.length > 0) params.set('districts', filters.districts.join(','))
  if (filters.providers.length > 0) params.set('providers', filters.providers.join(','))
  if (filters.maxDepositMonths !== '') params.set('maxDeposit', String(filters.maxDepositMonths))
  if (filters.pets) params.set('pets', '1')
  if (filters.couples) params.set('couples', '1')
  if (filters.furnished) params.set('furnished', '1')
  if (filters.availableOnly) params.set('available', '1')
  if (filters.moveIn) params.set('moveIn', filters.moveIn)

  return params
}

/** Cheapest listed price within budget, or unknown price kept visible. */
export function dormWithinBudget(dorm: Dorm, maxPrice: number): boolean {
  const entry = dorm.price_min ?? dorm.price_max
  if (entry == null) return true
  return entry <= maxPrice
}

function availabilityRank(status: AvailabilityStatus['status'] | undefined): number {
  if (status === 'available') return 0
  if (status === 'unknown') return 1
  return 2
}

export function applyFilters(
  dorms: Dorm[],
  filters: FilterState,
  availability: Record<string, AvailabilityStatus> = {},
): Dorm[] {
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
    result = result.filter((d) => dormWithinBudget(d, filters.maxPrice))
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

  if (filters.availableOnly) {
    result = result.filter((d) => availability[d.id]?.status === 'available')
  }

  result.sort((a, b) => {
    let cmp = 0
    switch (filters.sort) {
      case 'available_first': {
        cmp = availabilityRank(availability[a.id]?.status) - availabilityRank(availability[b.id]?.status)
        if (cmp === 0) cmp = (a.price_min ?? 9999) - (b.price_min ?? 9999)
        break
      }
      case 'price_asc':
        cmp = (a.price_min ?? 9999) - (b.price_min ?? 9999)
        break
      case 'price_desc':
        cmp = (b.price_min ?? 0) - (a.price_min ?? 0)
        break
      case 'district_asc':
        cmp = (a.district ?? 99) - (b.district ?? 99)
        break
      case 'created_desc':
        cmp = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        break
    }

    if (cmp !== 0) return cmp
    if (filters.sort !== 'available_first') {
      return availabilityRank(availability[a.id]?.status) - availabilityRank(availability[b.id]?.status)
    }
    return a.name.localeCompare(b.name)
  })

  return result
}

function paramValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function isSortKey(value: string): value is SortKey {
  return ['price_asc', 'price_desc', 'district_asc', 'created_desc', 'available_first'].includes(value)
}
