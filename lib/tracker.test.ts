import { describe, expect, it } from 'vitest'
import { TRACKER_STATUSES, TRACKER_STATUS_ORDER, isTrackerStatus } from './tracker'

describe('isTrackerStatus', () => {
  it('accepts every known status', () => {
    for (const status of TRACKER_STATUSES) {
      expect(isTrackerStatus(status)).toBe(true)
    }
  })

  it('rejects unknown values', () => {
    expect(isTrackerStatus('archived')).toBe(false)
    expect(isTrackerStatus('')).toBe(false)
    expect(isTrackerStatus('Interested')).toBe(false)
  })
})

describe('TRACKER_STATUS_ORDER', () => {
  it('includes every status exactly once', () => {
    expect([...TRACKER_STATUS_ORDER].sort()).toEqual([...TRACKER_STATUSES].sort())
  })
})
