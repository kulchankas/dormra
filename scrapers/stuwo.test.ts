import { describe, expect, it } from 'vitest'
import { parseStuwoAvailability } from './stuwo'

const NAV_BOOK_NOW = `
<nav><a href="/">BOOK NOW!</a></nav>
<main>
  <h2>Our prices at a glance</h2>
  <div>Category A — 703€</div>
  <div>BOOK NOW Category B</div>
  <div>Category D — 455€</div>
  <div>BOOK NOW Category D</div>
</main>
`

describe('parseStuwoAvailability', () => {
  it('returns available when category BOOK NOW buttons are present', () => {
    const { available, rawText } = parseStuwoAvailability(NAV_BOOK_NOW)
    expect(available).toBe(true)
    expect(rawText).toMatch(/Category B/)
  })

  it('returns unavailable when price section says fully booked', () => {
    const html = `
      <nav>BOOK NOW!</nav>
      <main>
        <h2>Our prices at a glance</h2>
        <p>Category A — fully booked</p>
        <p>Category B — fully booked</p>
      </main>
    `
    expect(parseStuwoAvailability(html).available).toBe(false)
  })

  it('ignores nav BOOK NOW when no category buttons exist', () => {
    const html = `
      <nav><a>BOOK NOW!</a></nav>
      <main><p>Contact us for waiting list information.</p></main>
    `
    expect(parseStuwoAvailability(html).available).toBe(false)
  })

  it('handles German unavailable copy', () => {
    const html = `
      <main>
        <h2>Unsere Preise</h2>
        <p>Kategorie A — ausgebucht</p>
      </main>
    `
    expect(parseStuwoAvailability(html).available).toBe(false)
  })
})
