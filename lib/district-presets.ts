/**
 * Vienna district presets for quick-pick filters on /dorms.
 * Districts are approximate clusters around major universities — not exact commute times.
 */
export type DistrictPreset = {
  id: string
  label: string
  districts: number[]
}

export const DISTRICT_PRESETS: DistrictPreset[] = [
  { id: 'tu', label: 'Near TU Wien', districts: [4, 5, 15] },
  { id: 'uni', label: 'Near Uni Wien', districts: [1, 8, 9] },
  { id: 'wu', label: 'Near WU', districts: [2, 11, 22] },
  { id: 'boku', label: 'Near BOKU', districts: [18, 19] },
  { id: 'meduni', label: 'Near MedUni', districts: [9, 18] },
]

export function districtsMatch(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort((x, y) => x - y)
  const sortedB = [...b].sort((x, y) => x - y)
  return sortedA.every((value, index) => value === sortedB[index])
}

export function toggleDistrictPreset(
  filters: { districts: number[] },
  preset: DistrictPreset,
): number[] {
  return districtsMatch(filters.districts, preset.districts) ? [] : [...preset.districts]
}
