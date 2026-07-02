import { describe, expect, it } from 'vitest'
import { countMatches } from './alertMatch'
import type { Dorm } from './types/dorm'

const dorm = (overrides: Partial<Dorm>): Dorm => ({
  id: '1',
  slug: 'test',
  provider: 'OeAD',
  name: 'Test',
  address: null,
  district: 9,
  price_min: 400,
  price_max: 500,
  deposit_eur: null,
  deposit_months: 2,
  website_url: null,
  apply_url: null,
  scrape_url: null,
  scrape_type: null,
  pets: false,
  couples: false,
  furnished: null,
  min_stay_months: null,
  max_stay_months: null,
  notes: null,
  active: true,
  created_at: '',
  image_url: null,
  ...overrides,
})

describe('countMatches', () => {
  const dorms = [
    dorm({ id: '1', district: 9, price_min: 400, deposit_months: 2 }),
    dorm({ id: '2', district: 1, price_min: 800, deposit_months: 3 }),
  ]

  it('counts all dorms when no filters', () => {
    expect(countMatches(dorms, {
      price_max: null,
      districts: null,
      deposit_max: null,
      pets_required: false,
      couples: false,
    })).toBe(2)
  })

  it('filters by price and deposit months', () => {
    expect(countMatches(dorms, {
      price_max: 500,
      districts: null,
      deposit_max: 2,
      pets_required: false,
      couples: false,
    })).toBe(1)
  })
})
