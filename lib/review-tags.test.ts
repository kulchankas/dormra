import { describe, expect, it } from 'vitest'
import { computeTagCounts, isReviewTag, MAX_TAGS_PER_REVIEW, sanitizeReviewTags, REVIEW_TAGS } from './review-tags'

describe('isReviewTag', () => {
  it('accepts every known tag', () => {
    for (const tag of REVIEW_TAGS) {
      expect(isReviewTag(tag)).toBe(true)
    }
  })

  it('rejects unknown strings', () => {
    expect(isReviewTag('smells_like_cabbage')).toBe(false)
    expect(isReviewTag('')).toBe(false)
  })
})

describe('sanitizeReviewTags', () => {
  it('drops unknown tags', () => {
    expect(sanitizeReviewTags(['clean', 'made_up_tag'])).toEqual(['clean'])
  })

  it('deduplicates', () => {
    expect(sanitizeReviewTags(['clean', 'clean', 'quiet_dorm'])).toEqual(['clean', 'quiet_dorm'])
  })

  it('caps at MAX_TAGS_PER_REVIEW', () => {
    const result = sanitizeReviewTags([...REVIEW_TAGS])
    expect(result.length).toBe(MAX_TAGS_PER_REVIEW)
  })

  it('returns an empty array for no tags', () => {
    expect(sanitizeReviewTags([])).toEqual([])
  })
})

describe('computeTagCounts', () => {
  it('counts tag frequency across reviews', () => {
    const result = computeTagCounts([
      ['thin_walls', 'clean'],
      ['thin_walls'],
      ['clean'],
      [],
    ])
    // tied at count 2 — alphabetical tie-break puts 'clean' before 'thin_walls'
    expect(result).toEqual([
      { tag: 'clean', count: 2 },
      { tag: 'thin_walls', count: 2 },
    ])
  })

  it('sorts most-mentioned first, ties broken alphabetically', () => {
    const result = computeTagCounts([['quiet_dorm'], ['party_dorm'], ['clean'], ['clean']])
    expect(result[0]).toEqual({ tag: 'clean', count: 2 })
    // party_dorm before quiet_dorm alphabetically when tied at count 1
    expect(result.slice(1)).toEqual([
      { tag: 'party_dorm', count: 1 },
      { tag: 'quiet_dorm', count: 1 },
    ])
  })

  it('ignores unknown tags baked into stored rows', () => {
    const result = computeTagCounts([['clean', 'legacy_unknown_tag']])
    expect(result).toEqual([{ tag: 'clean', count: 1 }])
  })

  it('returns an empty array when no reviews have tags', () => {
    expect(computeTagCounts([[], []])).toEqual([])
  })
})
