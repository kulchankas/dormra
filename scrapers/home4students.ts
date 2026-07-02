import * as cheerio from 'cheerio'
import type { ScraperResult } from './types'
import { BOT_UA, scrapeFailure } from './shared'

const TIMEOUT_MS = 15_000
const VACANCY_URL = 'https://www.home4students.at/en/vacancy/'

/** Address fragments used to match a dorm to vacancy room cards or text windows. */
export const DORM_ADDRESS_KEYWORDS: Record<string, string[]> = {
  'h4s-grosse-schiffgasse': ['Große Schiffgasse', 'Schiffgasse 12'],
  'h4s-schaeffergasse': ['Schäffergasse', 'Schaeffergasse'],
  'h4s-neudeggergasse': ['Neudeggergasse'],
  'h4s-boltzmanngasse': ['Boltzmanngasse'],
  'h4s-hofergasse': ['Höfergasse', 'Hofergasse'],
  'h4s-sensengasse': ['Sensengasse'],
  'h4s-erlachplatz': ['Erlachplatz'],
  'h4s-ullmannstrasse': ['Ullmannstraße', 'Ullmannstrasse'],
  // Front + back share one building listing on the vacancy page — same keywords, same availability.
  'h4s-doebling-front': ['Döblinger Hauptstraße', 'Doeblinger Hauptstrasse'],
  'h4s-doebling-back': ['Döblinger Hauptstraße', 'Doeblinger Hauptstrasse'],
  'h4s-popup-seestadt': ['Sonnenallee 105', 'PopUp', 'Seestadt'],
}

const AVAILABILITY_KEYWORDS = [
  'frei',
  'verfügbar',
  'vacancy',
  'available',
  'free room',
  'freie',
  'zimmer frei',
  'platz frei',
  'apply now',
]

const UNAVAILABLE_KEYWORDS = [
  'ausgebucht',
  'fully booked',
  'no vacancy',
  'keine freien',
  'waitlist',
]

export type RoomCard = { address: string; text: string }

export function extractRoomCards(html: string): RoomCard[] {
  const $ = cheerio.load(html)
  const cards: RoomCard[] = []

  $('.room-card').each((_, el) => {
    const address = $(el).find('.room-card-h1').first().text().replace(/\s+/g, ' ').trim()
    const text = $(el).find('.room-card-info').text().replace(/\s+/g, ' ').trim()
    if (address) cards.push({ address, text })
  })

  return cards
}

export function addressMatchesKeywords(address: string, keywords: string[]): boolean {
  const lower = address.toLowerCase()
  return keywords.some((kw) => lower.includes(kw.toLowerCase()))
}

function textFromKeyword(fullText: string, keyword: string): string | null {
  const lower = fullText.toLowerCase()
  const idx = lower.indexOf(keyword.toLowerCase())
  if (idx === -1) return null

  const tail = fullText.slice(idx)
  const nextSection = tail.slice(keyword.length).search(/\d{1,2}\.,\s/)
  const end = nextSection >= 0 ? keyword.length + nextSection : Math.min(tail.length, 220)
  return tail.slice(0, end).trim()
}

function parseFromTextWindow(rawFull: string, keywords: string[]): { available: boolean; rawText: string } {
  let scope = rawFull
  for (const keyword of keywords) {
    const window = textFromKeyword(rawFull, keyword)
    if (window) {
      scope = window
      break
    }
  }

  const lower = scope.toLowerCase()
  const unavailable = UNAVAILABLE_KEYWORDS.some((kw) => lower.includes(kw))
  const available = !unavailable && AVAILABILITY_KEYWORDS.some((kw) => lower.includes(kw))

  return { available, rawText: scope.slice(0, 500) }
}

export function parseHome4StudentsAvailability(
  html: string,
  dormSlug: string,
): { available: boolean; rawText: string } {
  const keywords = DORM_ADDRESS_KEYWORDS[dormSlug]
  const roomCards = extractRoomCards(html)

  if (roomCards.length > 0 && keywords) {
    const matching = roomCards.filter((card) => addressMatchesKeywords(card.address, keywords))
    if (matching.length > 0) {
      const rawText = matching.map((c) => c.address).join('; ').slice(0, 500)
      return { available: true, rawText }
    }
    return {
      available: false,
      rawText: `No vacancy cards for ${keywords[0]}`,
    }
  }

  // Fallback when page has no structured cards (or unknown slug).
  const $ = cheerio.load(html)
  $('nav, header, footer, script, style, noscript').remove()

  const contentEl =
    $('main').length ? $('main') :
    $('[role="main"]').length ? $('[role="main"]') :
    $('#content').length ? $('#content') :
    $('body')

  const rawFull = contentEl.text().replace(/\s+/g, ' ').trim()

  if (keywords) {
    return parseFromTextWindow(rawFull, keywords)
  }

  const lower = rawFull.toLowerCase()
  const unavailable = UNAVAILABLE_KEYWORDS.some((kw) => lower.includes(kw))
  const available = !unavailable && AVAILABILITY_KEYWORDS.some((kw) => lower.includes(kw))
  return { available, rawText: rawFull.slice(0, 500) }
}

export async function scrapeHome4Students(
  dormSlug: string,
  scrapeUrl: string,
  _browser?: unknown,
  htmlCache?: import('@/lib/scrape-html-cache').ScrapeHtmlCache,
): Promise<ScraperResult> {
  const targetUrl = scrapeUrl || VACANCY_URL

  const fetchHtml = async (): Promise<string> => {
    const abort = new AbortController()
    const timer = setTimeout(() => abort.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(targetUrl, {
        signal: abort.signal,
        headers: {
          'User-Agent': BOT_UA,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en,de;q=0.8',
        },
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from ${targetUrl}`)
      }
      return res.text()
    } finally {
      clearTimeout(timer)
    }
  }

  let html: string
  try {
    html = htmlCache
      ? await htmlCache.getOrFetch(targetUrl, fetchHtml)
      : await fetchHtml()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return scrapeFailure(dormSlug, msg.includes('HTTP') ? msg : msg)
  }

  const { available, rawText } = parseHome4StudentsAvailability(html, dormSlug)

  return {
    dormSlug,
    available,
    roomsCount: null,
    rawText,
    scrapeOk: true,
    errorMsg: null,
  }
}
