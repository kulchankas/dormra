import { describe, expect, it } from 'vitest'
import { generatePseudonym, isPseudonym } from './pseudonym'

describe('generatePseudonym', () => {
  it('produces a string matching the "Adjective Noun #123" shape', () => {
    const name = generatePseudonym()
    expect(isPseudonym(name)).toBe(true)
  })

  it('is deterministic given a fixed random source', () => {
    const fixed = () => 0
    expect(generatePseudonym(fixed)).toBe(generatePseudonym(fixed))
  })

  it('produces varied output across many calls', () => {
    const names = new Set(Array.from({ length: 50 }, () => generatePseudonym()))
    expect(names.size).toBeGreaterThan(1)
  })

  it('never includes any real user identifier (pure function of randomness only)', () => {
    // generatePseudonym takes no user/email/id argument at all — this is a
    // structural guarantee, but assert the signature length as a guard against
    // a future accidental regression that starts threading identity through.
    expect(generatePseudonym.length).toBeLessThanOrEqual(1)
  })
})

describe('isPseudonym', () => {
  it('accepts well-formed pseudonyms', () => {
    expect(isPseudonym('Sleepy Otter #482')).toBe(true)
  })

  it('rejects real names or emails', () => {
    expect(isPseudonym('John Smith')).toBe(false)
    expect(isPseudonym('john@example.com')).toBe(false)
    expect(isPseudonym('')).toBe(false)
  })
})
