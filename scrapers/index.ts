import type { Browser } from 'playwright-core'
import type { ScraperResult } from './types'
import { scrapeHome4Students } from './home4students'
import { scrapeOeAD } from './oead'

export type ScraperFn = (
  dormSlug: string,
  scrapeUrl: string,
  browser?: Browser,
) => Promise<ScraperResult>

/** Maps normalized provider name → scraper function. */
const SCRAPERS: Record<string, ScraperFn> = {
  home4students: scrapeHome4Students,
  oead: scrapeOeAD,
}

export function getScraperForProvider(provider: string): ScraperFn | null {
  return SCRAPERS[provider.toLowerCase()] ?? null
}

export function getScrapableProviders(): string[] {
  return Object.keys(SCRAPERS)
}

export function usesBrowser(provider: string): boolean {
  return provider.toLowerCase() === 'oead'
}
