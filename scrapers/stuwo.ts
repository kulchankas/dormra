import * as cheerio from 'cheerio'
import type { ScraperResult } from './types'
import { BOT_UA, scrapeFailure } from './shared'

const TIMEOUT_MS = 15_000

const UNAVAILABLE_PATTERNS = [
  /fully booked/i,
  /ausgebucht/i,
  /sold out/i,
  /nicht buchbar/i,
  /no availability/i,
  /keine verfügbarkeit/i,
  /waitlist only/i,
]

/** Category price blocks show "BOOK NOW Category …" when rooms are bookable. Nav uses "BOOK NOW!". */
export function parseStuwoAvailability(html: string): { available: boolean; rawText: string } {
  const withoutNav = html.replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
  const $ = cheerio.load(withoutNav)
  $('header, footer, script, style, noscript').remove()

  const text = $.root().text().replace(/\s+/g, ' ').trim()
  const priceIdx = text.search(/Our prices at a glance|Unsere Preise/i)
  const priceSection = priceIdx >= 0 ? text.slice(priceIdx, priceIdx + 4000) : text

  const hasCategoryBookNow =
    /BOOK NOW Category/i.test(withoutNav) ||
    /BOOK NOW\s+Category/i.test(withoutNav)

  const explicitlyUnavailable =
    UNAVAILABLE_PATTERNS.some((pattern) => pattern.test(priceSection)) && !hasCategoryBookNow

  const available = hasCategoryBookNow && !explicitlyUnavailable
  const rawText = (priceSection || text).slice(0, 500)

  return { available, rawText }
}

export async function scrapeStuwo(
  dormSlug: string,
  scrapeUrl: string,
  _browser?: unknown,
  htmlCache?: import('@/lib/scrape-html-cache').ScrapeHtmlCache,
): Promise<ScraperResult> {
  const fetchHtml = async (): Promise<string> => {
    const abort = new AbortController()
    const timer = setTimeout(() => abort.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(scrapeUrl, {
        signal: abort.signal,
        headers: {
          'User-Agent': BOT_UA,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en,de;q=0.8',
        },
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from ${scrapeUrl}`)
      }
      return res.text()
    } finally {
      clearTimeout(timer)
    }
  }

  let html: string
  try {
    html = htmlCache
      ? await htmlCache.getOrFetch(scrapeUrl, fetchHtml)
      : await fetchHtml()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return scrapeFailure(dormSlug, msg)
  }

  const { available, rawText } = parseStuwoAvailability(html)

  return {
    dormSlug,
    available,
    roomsCount: null,
    rawText,
    scrapeOk: true,
    errorMsg: null,
  }
}
