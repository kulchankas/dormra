import type { Dorm } from './helpers'

export type SortKey = 'price_asc' | 'price_desc' | 'district_asc' | 'created_desc'

export interface FilterState {
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

export const DEFAULT_FILTERS: FilterState = {
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

export function countActiveFilters(f: FilterState): number {
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

  return params
}

export function applyFilters(dorms: Dorm[], filters: FilterState): Dorm[] {
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
      case 'price_asc':
        return (a.price_min ?? 9999) - (b.price_min ?? 9999)
      case 'price_desc':
        return (b.price_min ?? 0) - (a.price_min ?? 0)
      case 'district_asc':
        return (a.district ?? 99) - (b.district ?? 99)
      case 'created_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return result
}

function paramValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function isSortKey(value: string): value is SortKey {
  return ['price_asc', 'price_desc', 'district_asc', 'created_desc'].includes(value)
}
