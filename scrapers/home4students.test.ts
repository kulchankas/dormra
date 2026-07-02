import { describe, expect, it } from 'vitest'
import {
  extractRoomCards,
  parseHome4StudentsAvailability,
} from './home4students'

const ROOM_CARD = (address: string, detail = 'Room available') => `
<div class="room-card">
  <div class="room-card-info">
    <div class="room-card-h2">Platz im Zimmer</div>
    <div class="room-card-h1">${address}</div>
    <div class="room-card-text"><p>${detail}</p></div>
  </div>
</div>
`

describe('extractRoomCards', () => {
  it('parses structured vacancy cards', () => {
    const html = `<main>${ROOM_CARD('Boltzmanngasse 10, 1090 Wien')}${ROOM_CARD('Ullmannstraße 54, 1150 Wien')}</main>`
    const cards = extractRoomCards(html)
    expect(cards).toHaveLength(2)
    expect(cards[0].address).toContain('Boltzmanngasse')
  })
})

describe('parseHome4StudentsAvailability', () => {
  it('marks dorm available when a matching room card exists', () => {
    const html = `<main>${ROOM_CARD('9., Boltzmanngasse 10, 1090 Wien')}</main>`
    expect(parseHome4StudentsAvailability(html, 'h4s-boltzmanngasse').available).toBe(true)
  })

  it('marks dorm unavailable when no matching room card', () => {
    const html = `<main>${ROOM_CARD('15., Ullmannstraße 54, 1150 Wien')}</main>`
    expect(parseHome4StudentsAvailability(html, 'h4s-boltzmanngasse').available).toBe(false)
  })

  it('treats Döbling front and back as the same building listing', () => {
    const html = `<main>${ROOM_CARD('Döblinger Hauptstraße 55, 1190 Wien')}</main>`
    const front = parseHome4StudentsAvailability(html, 'h4s-doebling-front')
    const back = parseHome4StudentsAvailability(html, 'h4s-doebling-back')
    expect(front.available).toBe(true)
    expect(back.available).toBe(true)
    expect(front.rawText).toContain('Döblinger')
  })

  it('marks both Döbling entries unavailable when no card matches', () => {
    const html = `<main>${ROOM_CARD('Erlachplatz 5, 1100 Wien')}</main>`
    expect(parseHome4StudentsAvailability(html, 'h4s-doebling-front').available).toBe(false)
    expect(parseHome4StudentsAvailability(html, 'h4s-doebling-back').available).toBe(false)
  })

  it('falls back to text window when no room cards on page', () => {
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

  it('returns unavailable when no keywords match in fallback mode', () => {
    const html = '<main><p>Registration open — join the waiting list.</p></main>'
    expect(parseHome4StudentsAvailability(html, 'h4s-neudeggergasse').available).toBe(false)
  })
})
