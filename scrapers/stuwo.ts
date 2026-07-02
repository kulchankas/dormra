import type { ScraperResult } from './types'
import { scrapeFailure } from './shared'

/** STUWO stub — registered so cron can route STUWO dorms; returns scrapeOk: false until implemented. */
export async function scrapeStuwo(dormSlug: string, scrapeUrl: string): Promise<ScraperResult> {
  void scrapeUrl
  return scrapeFailure(dormSlug, 'STUWO scraper not implemented yet')
}
