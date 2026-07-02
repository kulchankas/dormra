import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FILTERS,
  MIN_PRICE_FLOOR,
  applyFilters,
  dormAllowsShortStay,
  dormWithinBudget,
  filtersToSearchParams,
  haversineDistanceKm,
  parseFiltersFromParams,
} from './dorm-filters'
import type { Dorm } from './helpers'

const baseDorm = (overrides: Partial<Dorm>): Dorm => ({
  id: '1',
  slug: 'test',
  provider: 'OeAD',
  name: 'Test Dorm',
  address: null,
  district: 9,
  price_min: 500,
  price_max: 600,
  deposit_eur: null,
  deposit_months: 2,
  website_url: null,
  apply_url: null,
  scrape_url: null,
  scrape_type: null,
  pets: false,
  couples: false,
  furnished: true,
  min_stay_months: null,
  max_stay_months: null,
  notes: null,
  active: true,
  created_at: '2026-01-01T00:00:00Z',
  image_url: null,
  lat: null,
  lng: null,
  ...overrides,
})

describe('dormWithinBudget', () => {
  it('uses price_min when present', () => {
    expect(dormWithinBudget(baseDorm({ price_min: 400, price_max: 700 }), MIN_PRICE_FLOOR, 500)).toBe(true)
    expect(dormWithinBudget(baseDorm({ price_min: 600, price_max: 700 }), MIN_PRICE_FLOOR, 500)).toBe(false)
  })

  it('falls back to price_max when price_min is null', () => {
    expect(dormWithinBudget(baseDorm({ price_min: null, price_max: 450 }), MIN_PRICE_FLOOR, 500)).toBe(true)
  })

  it('keeps dorms with unknown pricing visible', () => {
    expect(dormWithinBudget(baseDorm({ price_min: null, price_max: null }), MIN_PRICE_FLOOR, 500)).toBe(true)
  })

  it('excludes dorms priced below the minimum', () => {
    expect(dormWithinBudget(baseDorm({ price_min: 300, price_max: 350 }), 400, 1500)).toBe(false)
    expect(dormWithinBudget(baseDorm({ price_min: 450, price_max: 500 }), 400, 1500)).toBe(true)
  })
})

describe('dormAllowsShortStay', () => {
  it('allows dorms with no minimum stay requirement', () => {
    expect(dormAllowsShortStay(baseDorm({ min_stay_months: null }))).toBe(true)
  })

  it('allows dorms with a short minimum stay', () => {
    expect(dormAllowsShortStay(baseDorm({ min_stay_months: 3 }))).toBe(true)
  })

  it('excludes dorms requiring a long minimum stay', () => {
    expect(dormAllowsShortStay(baseDorm({ min_stay_months: 12 }))).toBe(false)
  })
})

describe('haversineDistanceKm', () => {
  it('returns ~0 for identical coordinates', () => {
    const point = { lat: 48.2082, lng: 16.3738 }
    expect(haversineDistanceKm(point, point)).toBeCloseTo(0, 3)
  })

  it('computes a plausible distance across Vienna', () => {
    // TU Wien to Uni Wien — roughly 3km apart.
    const tuWien = { lat: 48.1983, lng: 16.3695 }
    const uniWien = { lat: 48.2131, lng: 16.3593 }
    const km = haversineDistanceKm(tuWien, uniWien)
    expect(km).toBeGreaterThan(1)
    expect(km).toBeLessThan(5)
  })
})

describe('applyFilters', () => {
  const dorms = [
    baseDorm({ id: 'a', name: 'Alpha', price_min: 400, district: 9 }),
    baseDorm({ id: 'b', name: 'Beta', price_min: 700, district: 10 }),
    baseDorm({ id: 'c', name: 'Gamma', price_min: 450, district: 9, couples: true }),
  ]

  const availability = {
    a: { status: 'available' as const, label: 'Available' },
    b: { status: 'fully_booked' as const, label: 'Fully booked' },
    c: { status: 'unknown' as const, label: 'Status unknown' },
  }

  it('filters by max price using cheapest listed rate', () => {
    const result = applyFilters(dorms, { ...DEFAULT_FILTERS, maxPrice: 500 }, availability)
    expect(result.map((d) => d.id)).toEqual(['a', 'c'])
  })

  it('filters available only', () => {
    const result = applyFilters(
      dorms,
      { ...DEFAULT_FILTERS, availableOnly: true },
      availability,
    )
    expect(result.map((d) => d.id)).toEqual(['a'])
  })

  it('sorts available first when selected', () => {
    const result = applyFilters(
      dorms,
      { ...DEFAULT_FILTERS, sort: 'available_first' },
      availability,
    )
    expect(result.map((d) => d.id)).toEqual(['a', 'c', 'b'])
  })

  it('uses availability as tiebreaker for price sort', () => {
    const priced = [
      baseDorm({ id: 'x', price_min: 500 }),
      baseDorm({ id: 'y', price_min: 500 }),
    ]
    const avail = {
      x: { status: 'fully_booked' as const, label: 'Fully booked' },
      y: { status: 'available' as const, label: 'Available' },
    }
    const result = applyFilters(priced, { ...DEFAULT_FILTERS, sort: 'price_asc' }, avail)
    expect(result.map((d) => d.id)).toEqual(['y', 'x'])
  })

  it('filters by min price, excluding cheaper dorms', () => {
    const result = applyFilters(dorms, { ...DEFAULT_FILTERS, minPrice: 420 }, availability)
    expect(result.map((d) => d.id)).toEqual(['c', 'b'])
  })

  it('filters short-stay-friendly dorms', () => {
    const mixed = [
      baseDorm({ id: 'short', min_stay_months: 3 }),
      baseDorm({ id: 'long', min_stay_months: 12 }),
      baseDorm({ id: 'unset', min_stay_months: null }),
    ]
    const result = applyFilters(mixed, { ...DEFAULT_FILTERS, shortStayOk: true })
    expect(result.map((d) => d.id).sort()).toEqual(['short', 'unset'])
  })

  it('sorts by distance when distance data is provided', () => {
    const result = applyFilters(
      dorms,
      { ...DEFAULT_FILTERS, sort: 'distance' },
      availability,
      { a: 5, b: 1, c: 3 },
    )
    expect(result.map((d) => d.id)).toEqual(['b', 'c', 'a'])
  })
})

describe('parseFiltersFromParams / filtersToSearchParams', () => {
  it('round-trips availability and move-in params', () => {
    const parsed = parseFiltersFromParams({
      maxPrice: '600',
      available: '1',
      moveIn: '2026-09-01',
      q: 'arsenal',
    })
    expect(parsed.maxPrice).toBe(600)
    expect(parsed.availableOnly).toBe(true)
    expect(parsed.moveIn).toBe('2026-09-01')
    expect(parsed.search).toBe('arsenal')

    const params = filtersToSearchParams(parsed)
    expect(params.get('available')).toBe('1')
    expect(params.get('moveIn')).toBe('2026-09-01')
    expect(params.get('q')).toBe('arsenal')
  })

  it('round-trips min price and short-stay params', () => {
    const parsed = parseFiltersFromParams({ minPrice: '450', shortStay: '1' })
    expect(parsed.minPrice).toBe(450)
    expect(parsed.shortStayOk).toBe(true)

    const params = filtersToSearchParams(parsed)
    expect(params.get('minPrice')).toBe('450')
    expect(params.get('shortStay')).toBe('1')
  })
})
