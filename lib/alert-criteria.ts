export type AlertCriteria = {
  districts: number[] | null
  price_max: number | null
  pets_required: boolean | null
  couples: boolean | null
  deposit_max: number | null
}

export type DormForMatching = {
  district: number | null
  price_min: number | null
  pets: boolean | null
  couples: boolean | null
  deposit_months: number | null
}

export function dormMatchesAlert(dorm: DormForMatching, alert: AlertCriteria): boolean {
  if (alert.districts && alert.districts.length > 0) {
    if (dorm.district === null || !alert.districts.includes(dorm.district)) return false
  }

  if (alert.price_max !== null && dorm.price_min !== null) {
    if (dorm.price_min > alert.price_max) return false
  }

  if (alert.pets_required === true && dorm.pets !== true) return false

  if (alert.couples === true && dorm.couples !== true) return false

  if (alert.deposit_max !== null && dorm.deposit_months !== null) {
    if (dorm.deposit_months > alert.deposit_max) return false
  }

  return true
}
