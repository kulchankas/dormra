import type { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getScrapableProviders, getScraperForProvider, usesBrowser } from '@/scrapers'
import { launchScraperBrowser } from '@/scrapers/browser'
import { processSnapshot } from '@/lib/diff'

export const maxDuration = 300

const DELAY_MS = 500

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function GET(request: NextRequest) {
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (request.headers.get('authorization') !== expected) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  let scraped = 0
  let errors = 0
  const byProvider: Record<string, { scraped: number; errors: number }> = {}

  const admin = createAdminClient()
  type DormRow = { id: string; slug: string; scrape_url: string | null; provider: string }

  for (const provider of getScrapableProviders()) {
    byProvider[provider] = { scraped: 0, errors: 0 }

    const scraper = getScraperForProvider(provider)
    if (!scraper) continue

    const { data: dorms, error: fetchError } = await admin
      .from('dorms')
      .select('id, slug, scrape_url, provider')
      .ilike('provider', provider)
      .not('scrape_url', 'is', null)

    if (fetchError || !dorms) {
      console.error(`[CRON] Failed to fetch ${provider} dorms:`, fetchError?.message)
      return Response.json({ ok: false, error: fetchError?.message }, { status: 500 })
    }

    const browser = usesBrowser(provider) ? await launchScraperBrowser() : null

    try {
      for (const dorm of dorms as DormRow[]) {
        try {
          const result = await scraper(dorm.slug, dorm.scrape_url as string, browser ?? undefined)
          await processSnapshot(dorm.id, result)

          if (!result.scrapeOk) {
            console.warn(`[CRON] Scrape soft-failed for ${dorm.slug}: ${result.errorMsg}`)
            errors++
            byProvider[provider].errors++
          } else {
            scraped++
            byProvider[provider].scraped++
          }
        } catch (err) {
          console.error(`[CRON] Unhandled error for ${dorm.slug}:`, err)
          errors++
          byProvider[provider].errors++
        }

        await delay(DELAY_MS)
      }
    } finally {
      await browser?.close()
    }
  }

  return Response.json({
    ok: true,
    scraped,
    errors,
    byProvider,
    duration_ms: Date.now() - start,
  })
}
