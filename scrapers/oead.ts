import type { Browser } from 'playwright-core'
import type { ScraperResult } from './types'
import { SCRAPE_TIMEOUT_MS, parseOeADAvailability, scrapeFailure } from './shared'
import { dismissCookieBanner, launchScraperBrowser } from './browser'

export async function scrapeOeAD(
  dormSlug: string,
  scrapeUrl: string,
  existingBrowser?: Browser,
): Promise<ScraperResult> {
  const ownsBrowser = !existingBrowser
  const browser = existingBrowser ?? await launchScraperBrowser()

  try {
    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en,de;q=0.8',
    })

    await page.goto(scrapeUrl, {
      waitUntil: 'networkidle',
      timeout: SCRAPE_TIMEOUT_MS,
    })

    await dismissCookieBanner(page)

    // Booking block for this residence (not the "Other accommodation" carousel).
    const applyBlock = page.locator('.block.buttons').first()
    await applyBlock.waitFor({ state: 'attached', timeout: SCRAPE_TIMEOUT_MS })

    const buttonsText = await applyBlock.innerText()
    const rawText = buttonsText.replace(/\s+/g, ' ').trim().slice(0, 500)
    const available = parseOeADAvailability(buttonsText)

    return {
      dormSlug,
      available,
      roomsCount: null,
      rawText,
      scrapeOk: true,
      errorMsg: null,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return scrapeFailure(dormSlug, msg)
  } finally {
    if (ownsBrowser) await browser.close()
  }
}

// Re-export for tests
export { parseOeADAvailability }
