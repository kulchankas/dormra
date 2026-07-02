import { describe, expect, it } from 'vitest'
import { dormMatchesAlert, type AlertCriteria } from './alert-criteria'

const baseDorm = {
  district: 9,
  price_min: 400,
  pets: false,
  couples: false,
  deposit_months: 2,
}

const baseAlert: AlertCriteria = {
  districts: null,
  price_max: null,
  pets_required: false,
  couples: false,
  deposit_max: null,
}

describe('dormMatchesAlert', () => {
  it('matches when no filters are set', () => {
    expect(dormMatchesAlert(baseDorm, baseAlert)).toBe(true)
  })

  it('filters by district', () => {
    expect(dormMatchesAlert(baseDorm, { ...baseAlert, districts: [9] })).toBe(true)
    expect(dormMatchesAlert(baseDorm, { ...baseAlert, districts: [1, 2] })).toBe(false)
  })

  it('filters by max price', () => {
    expect(dormMatchesAlert(baseDorm, { ...baseAlert, price_max: 400 })).toBe(true)
    expect(dormMatchesAlert(baseDorm, { ...baseAlert, price_max: 350 })).toBe(false)
  })

  it('filters by deposit months (not euros)', () => {
    expect(dormMatchesAlert(baseDorm, { ...baseAlert, deposit_max: 2 })).toBe(true)
    expect(dormMatchesAlert(baseDorm, { ...baseAlert, deposit_max: 1 })).toBe(false)
  })

  it('filters by pets and couples requirements', () => {
    expect(dormMatchesAlert(baseDorm, { ...baseAlert, pets_required: true })).toBe(false)
    expect(dormMatchesAlert({ ...baseDorm, pets: true }, { ...baseAlert, pets_required: true })).toBe(true)
    expect(dormMatchesAlert(baseDorm, { ...baseAlert, couples: true })).toBe(false)
    expect(dormMatchesAlert({ ...baseDorm, couples: true }, { ...baseAlert, couples: true })).toBe(true)
  })
})
