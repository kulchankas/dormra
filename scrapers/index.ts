import type { Browser } from 'playwright-core'
import type { ScraperResult } from './types'
import { scrapeHome4Students } from './home4students'
import { scrapeOeAD } from './oead'
import { scrapeStuwo } from './stuwo'

export type ScraperFn = (
  dormSlug: string,
  scrapeUrl: string,
  browser?: Browser,
) => Promise<ScraperResult>

export interface Scraper {
  scrape: ScraperFn
  usesBrowser: boolean
}

/** Maps normalized provider name → scraper implementation. */
const SCRAPERS: Record<string, Scraper> = {
  home4students: { scrape: scrapeHome4Students, usesBrowser: false },
  oead: { scrape: scrapeOeAD, usesBrowser: true },
  stuwo: { scrape: scrapeStuwo, usesBrowser: false },
}

export function getScraperForProvider(provider: string): Scraper | null {
  return SCRAPERS[provider.toLowerCase()] ?? null
}

export function getRegisteredProviders(): string[] {
  return Object.keys(SCRAPERS)
}

export function usesBrowser(provider: string): boolean {
  return getScraperForProvider(provider)?.usesBrowser ?? false
}

/** @deprecated Use getRegisteredProviders() */
export function getScrapableProviders(): string[] {
  return getRegisteredProviders()
}
