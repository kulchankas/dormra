import { describe, expect, it } from 'vitest'
import {
  computeRatingSummary,
  isReportReason,
  ratingSummaryMapToRecord,
  reviewInputSchema,
  REVIEW_BODY_MAX_LENGTH,
  REVIEW_BODY_MIN_LENGTH,
} from './dorm-reviews'

describe('computeRatingSummary', () => {
  it('returns null average and zero count for no ratings', () => {
    expect(computeRatingSummary([])).toEqual({ average: null, count: 0 })
  })

  it('averages a single rating', () => {
    expect(computeRatingSummary([4])).toEqual({ average: 4, count: 1 })
  })

  it('averages multiple ratings', () => {
    expect(computeRatingSummary([5, 3, 4])).toEqual({ average: 4, count: 3 })
  })

  it('does not hide sample size behind a smoothed average', () => {
    // A single 1-star review should show as a plain 1.0, not nudged toward
    // some global prior — see docs/COMMUNITY_REVIEWS.md §5 for why the MVP
    // intentionally shows raw average + count instead of a Bayesian blend.
    const summary = computeRatingSummary([1])
    expect(summary.average).toBe(1)
    expect(summary.count).toBe(1)
  })
})

describe('ratingSummaryMapToRecord', () => {
  it('converts a Map to a plain serializable object', () => {
    const map = new Map([
      ['dorm-a', { average: 4.5, count: 2 }],
      ['dorm-b', { average: null, count: 0 }],
    ])
    expect(ratingSummaryMapToRecord(map)).toEqual({
      'dorm-a': { average: 4.5, count: 2 },
      'dorm-b': { average: null, count: 0 },
    })
  })
})

describe('reviewInputSchema', () => {
  it('accepts a valid rating + body', () => {
    const result = reviewInputSchema.safeParse({ rating: 5, body: 'Great place to live!' })
    expect(result.success).toBe(true)
  })

  it('rejects ratings outside 1-5', () => {
    expect(reviewInputSchema.safeParse({ rating: 0, body: 'x'.repeat(20) }).success).toBe(false)
    expect(reviewInputSchema.safeParse({ rating: 6, body: 'x'.repeat(20) }).success).toBe(false)
  })

  it('rejects bodies shorter than the minimum length', () => {
    const result = reviewInputSchema.safeParse({ rating: 3, body: 'x'.repeat(REVIEW_BODY_MIN_LENGTH - 1) })
    expect(result.success).toBe(false)
  })

  it('rejects bodies longer than the maximum length', () => {
    const result = reviewInputSchema.safeParse({ rating: 3, body: 'x'.repeat(REVIEW_BODY_MAX_LENGTH + 1) })
    expect(result.success).toBe(false)
  })

  it('trims whitespace before validating length', () => {
    const padded = `  ${'x'.repeat(REVIEW_BODY_MIN_LENGTH)}  `
    const result = reviewInputSchema.safeParse({ rating: 3, body: padded })
    expect(result.success).toBe(true)
  })
})

describe('isReportReason', () => {
  it('accepts known reasons', () => {
    expect(isReportReason('spam')).toBe(true)
    expect(isReportReason('harassment')).toBe(true)
    expect(isReportReason('false_info')).toBe(true)
    expect(isReportReason('off_topic')).toBe(true)
    expect(isReportReason('other')).toBe(true)
  })

  it('rejects unknown reasons', () => {
    expect(isReportReason('defamation')).toBe(false)
    expect(isReportReason('')).toBe(false)
  })
})
