import * as cheerio from 'cheerio'
import type { ScraperResult } from './types'
import { BOT_UA, scrapeFailure } from './shared'

const TIMEOUT_MS = 15_000

// Keywords indicating rooms are currently available (EN + DE)
const AVAILABILITY_KEYWORDS = [
  'frei', 'verfügbar', 'vacancy', 'available', 'free room', 'freie',
  'zimmer frei', 'platz frei', 'apply now',
]

export async function scrapeHome4Students(
  dormSlug: string,
  scrapeUrl: string,
): Promise<ScraperResult> {
  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS)

  let html: string
  try {
    const res = await fetch(scrapeUrl, {
      signal: abort.signal,
      headers: {
        'User-Agent': BOT_UA,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en,de;q=0.8',
      },
    })
    if (!res.ok) {
      return scrapeFailure(dormSlug, `HTTP ${res.status} from ${scrapeUrl}`)
    }
    html = await res.text()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return scrapeFailure(dormSlug, abort.signal.aborted ? `Timed out after ${TIMEOUT_MS}ms` : msg)
  } finally {
    clearTimeout(timer)
  }

  const $ = cheerio.load(html)

  // Remove nav, header, footer, scripts — we only want the editorial content
  $('nav, header, footer, script, style, noscript').remove()

  // Prefer main content selectors; fall back to body
  const contentEl =
    $('main').length ? $('main') :
    $('[role="main"]').length ? $('[role="main"]') :
    $('#content').length ? $('#content') :
    $('body')

  const rawFull = contentEl.text().replace(/\s+/g, ' ').trim()
  const rawText = rawFull.slice(0, 500)

  const lower = rawFull.toLowerCase()
  const available = AVAILABILITY_KEYWORDS.some(kw => lower.includes(kw))

  return {
    dormSlug,
    available,
    roomsCount: null, // home4students vacancy page doesn't expose a count
    rawText,
    scrapeOk: true,
    errorMsg: null,
  }
}

