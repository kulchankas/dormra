import { dormMatchesAlert, type AlertCriteria } from './alert-criteria'
import type { Dorm } from './types/dorm'

/** UI-facing criteria for live match previews (excludes move_in_before — not matched yet). */
export type UIMatchCriteria = {
  price_max: number | null
  districts: number[] | null
  deposit_max: number | null
  pets_required: boolean
  couples: boolean
}

function toAlertCriteria(criteria: UIMatchCriteria): AlertCriteria {
  return {
    price_max: criteria.price_max,
    districts: criteria.districts && criteria.districts.length > 0 ? criteria.districts : null,
    deposit_max: criteria.deposit_max,
    pets_required: criteria.pets_required,
    couples: criteria.couples,
  }
}

export function countMatches(dorms: Dorm[], criteria: UIMatchCriteria): number {
  const alert = toAlertCriteria(criteria)
  let n = 0
  for (const dorm of dorms) {
    if (dormMatchesAlert(dorm, alert)) n++
  }
  return n
}
