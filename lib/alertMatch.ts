import type { Dorm } from './helpers'

/**
 * The subset of alert criteria that can be matched against dorm data.
 * `move_in_before` is intentionally excluded — dorms carry no availability
 * date, so it can't be matched here.
 */
export type AlertCriteria = {
  price_max: number | null
  districts: number[] | null
  deposit_max: number | null
  pets_required: boolean
  couples: boolean
}

export function dormMatchesAlert(dorm: Dorm, a: AlertCriteria): boolean {
  // Budget: a room must be reachable within the max rent (compare on price_min).
  if (a.price_max != null && dorm.price_min != null && dorm.price_min > a.price_max) {
    return false
  }
  // Districts: if any selected, the dorm must be in one of them.
  if (a.districts && a.districts.length > 0) {
    if (dorm.district == null || !a.districts.includes(dorm.district)) return false
  }
  // Deposit cap (€): only filter when the dorm exposes a euro deposit.
  if (a.deposit_max != null && dorm.deposit_eur != null && dorm.deposit_eur > a.deposit_max) {
    return false
  }
  if (a.pets_required && dorm.pets !== true) return false
  if (a.couples && dorm.couples !== true) return false
  return true
}

export function countMatches(dorms: Dorm[], a: AlertCriteria): number {
  let n = 0
  for (const d of dorms) if (dormMatchesAlert(d, a)) n++
  return n
}
