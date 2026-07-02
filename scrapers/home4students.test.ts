import { describe, expect, it } from 'vitest'
import { parseHome4StudentsAvailability } from './home4students'

describe('parseHome4StudentsAvailability', () => {
  it('detects availability near a dorm address on the vacancy page', () => {
    const html = `
      <main>
        <section>9., Boltzmanngasse 10 — rooms available from September</section>
        <section>15., Ullmannstraße 54 — fully booked</section>
      </main>
    `
    expect(parseHome4StudentsAvailability(html, 'h4s-boltzmanngasse').available).toBe(true)
    expect(parseHome4StudentsAvailability(html, 'h4s-ullmannstrasse').available).toBe(false)
  })

  it('falls back to whole-page scan when slug is unknown', () => {
    const html = '<main><p>Rooms available for winter intake.</p></main>'
    expect(parseHome4StudentsAvailability(html, 'unknown-slug').available).toBe(true)
  })

  it('returns unavailable when no keywords match', () => {
    const html = '<main><p>Registration open — join the waiting list.</p></main>'
    expect(parseHome4StudentsAvailability(html, 'h4s-neudeggergasse').available).toBe(false)
  })
})
