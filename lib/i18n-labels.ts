import { DISTRICT_NAMES, ordinalSuffix } from './helpers'

type TranslateFn = (key: string, values?: Record<string, string | number>) => string

export function formatDistrictLabel(
  district: number | null,
  t: TranslateFn,
): string | null {
  if (!district) return null
  const name = DISTRICT_NAMES[district] ?? ''
  return t('districtWithName', {
    number: district,
    ordinal: ordinalSuffix(district),
    name,
  })
}

export function formatPriceLabel(
  min: number | null,
  max: number | null,
  t: TranslateFn,
): string {
  if (min && max) return t('priceRange', { min, max })
  if (min) return t('priceFrom', { min })
  return t('priceOnRequest')
}
