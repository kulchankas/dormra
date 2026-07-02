import { describe, expect, it } from 'vitest'
import { districtsMatch, toggleDistrictPreset, DISTRICT_PRESETS } from './district-presets'

describe('district-presets', () => {
  it('matches district sets regardless of order', () => {
    expect(districtsMatch([4, 5, 15], [15, 4, 5])).toBe(true)
    expect(districtsMatch([4, 5], [4, 5, 15])).toBe(false)
  })

  it('toggles preset on and off', () => {
    const preset = DISTRICT_PRESETS[0]
    const applied = { districts: toggleDistrictPreset({ districts: [] }, preset) }
    expect(applied.districts).toEqual(preset.districts)
    expect(toggleDistrictPreset(applied, preset)).toEqual([])
  })
})
