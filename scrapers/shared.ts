import type { ScraperResult } from './types'

export const BOT_UA = 'Dormra-Bot/1.0 (+https://dormra.eu/how-it-works)'
export const SCRAPE_TIMEOUT_MS = 30_000

export function scrapeFailure(dormSlug: string, errorMsg: string): ScraperResult {
  return { dormSlug, available: false, roomsCount: null, rawText: '', scrapeOk: false, errorMsg }
}

/** True when the residence has at least one bookable category. */
export function parseOeADAvailability(applyButtonsText: string): boolean {
  return !/fully booked|ausgebucht|komplett ausgebucht/i.test(applyButtonsText)
}
