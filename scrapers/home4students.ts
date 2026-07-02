import * as cheerio from 'cheerio'
import type { ScraperResult } from './types'
import { BOT_UA, scrapeFailure } from './shared'

const TIMEOUT_MS = 15_000
const VACANCY_URL = 'https://www.home4students.at/en/vacancy/'

// Address fragments used to locate a dorm block on the shared vacancy page.
const DORM_ADDRESS_KEYWORDS: Record<string, string[]> = {
  'h4s-grosse-schiffgasse': ['Große Schiffgasse', 'Schiffgasse 12'],
  'h4s-schaeffergasse': ['Schäffergasse', 'Schaeffergasse'],
  'h4s-neudeggergasse': ['Neudeggergasse'],
  'h4s-boltzmanngasse': ['Boltzmanngasse'],
  'h4s-hofergasse': ['Höfergasse', 'Hofergasse'],
  'h4s-sensengasse': ['Sensengasse'],
  'h4s-erlachplatz': ['Erlachplatz'],
  'h4s-ullmannstrasse': ['Ullmannstraße', 'Ullmannstrasse'],
  'h4s-doebling-front': ['Döblinger Hauptstraße', 'Doeblinger Hauptstrasse'],
  'h4s-doebling-back': ['Döblinger Hauptstraße', 'Doeblinger Hauptstrasse'],
  'h4s-popup-seestadt': ['Sonnenallee 105', 'PopUp'],
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

function textFromKeyword(fullText: string, keyword: string): string | null {
  const lower = fullText.toLowerCase()
  const idx = lower.indexOf(keyword.toLowerCase())
  if (idx === -1) return null

  const tail = fullText.slice(idx)
  const nextSection = tail.slice(keyword.length).search(/\d{1,2}\.,\s/)
  const end = nextSection >= 0 ? keyword.length + nextSection : Math.min(tail.length, 220)
  return tail.slice(0, end).trim()
}

export function parseHome4StudentsAvailability(
  html: string,
  dormSlug: string,
): { available: boolean; rawText: string } {
  const $ = cheerio.load(html)
  $('nav, header, footer, script, style, noscript').remove()

  const contentEl =
    $('main').length ? $('main') :
    $('[role="main"]').length ? $('[role="main"]') :
    $('#content').length ? $('#content') :
    $('body')

  const rawFull = contentEl.text().replace(/\s+/g, ' ').trim()
  const keywords = DORM_ADDRESS_KEYWORDS[dormSlug]
  let scope = rawFull

  if (keywords) {
    for (const keyword of keywords) {
      const window = textFromKeyword(rawFull, keyword)
      if (window) {
        scope = window
        break
      }
    }
  }

  const lower = scope.toLowerCase()
  const unavailable = UNAVAILABLE_KEYWORDS.some((kw) => lower.includes(kw))
  const available = !unavailable && AVAILABILITY_KEYWORDS.some((kw) => lower.includes(kw))

  return {
    available,
    rawText: scope.slice(0, 500),
  }
}

export async function scrapeHome4Students(
  dormSlug: string,
  scrapeUrl: string,
): Promise<ScraperResult> {
  const targetUrl = scrapeUrl || VACANCY_URL
  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS)

  let html: string
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
      return scrapeFailure(dormSlug, `HTTP ${res.status} from ${targetUrl}`)
    }
    html = await res.text()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return scrapeFailure(dormSlug, abort.signal.aborted ? `Timed out after ${TIMEOUT_MS}ms` : msg)
  } finally {
    clearTimeout(timer)
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
