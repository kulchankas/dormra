import type { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { authorizeCronRequest } from '@/lib/cron-auth'
import { ScrapeHtmlCache } from '@/lib/scrape-html-cache'
import { getScraperForProvider, usesBrowser } from '@/scrapers'
import { launchScraperBrowser } from '@/scrapers/browser'
import { processSnapshot } from '@/lib/diff'

export const maxDuration = 300

const DELAY_MS = 500

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function GET(request: NextRequest) {
  if (!authorizeCronRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  let scraped = 0
  let errors = 0
  let skipped = 0
  const byProvider: Record<string, { scraped: number; errors: number; skipped: number }> = {}

  const admin = createAdminClient()
  const htmlCache = new ScrapeHtmlCache()

  const { data: dorms, error: fetchError } = await admin
    .from('dorms')
    .select('id, slug, scrape_url, provider')
    .eq('active', true)
    .not('scrape_url', 'is', null)

  if (fetchError || !dorms) {
    console.error('[CRON] Failed to fetch dorms:', fetchError?.message)
    return Response.json({ ok: false, error: fetchError?.message }, { status: 500 })
  }

  const byProviderDorms = new Map<string, typeof dorms>()
  for (const dorm of dorms) {
    const key = dorm.provider.toLowerCase()
    const list = byProviderDorms.get(key) ?? []
    list.push(dorm)
    byProviderDorms.set(key, list)
  }

  for (const [providerKey, providerDorms] of byProviderDorms) {
    const scraper = getScraperForProvider(providerKey)
    byProvider[providerKey] = { scraped: 0, errors: 0, skipped: 0 }

    if (!scraper) {
      console.warn(
        `[CRON] No scraper registered for provider "${providerDorms[0]?.provider}" — skipping ${providerDorms.length} dorm(s)`,
      )
      skipped += providerDorms.length
      byProvider[providerKey].skipped = providerDorms.length
      continue
    }

    const browser = usesBrowser(providerKey) ? await launchScraperBrowser() : null

    try {
      for (const dorm of providerDorms) {
        try {
          const result = await scraper.scrape(
            dorm.slug,
            dorm.scrape_url as string,
            browser ?? undefined,
            htmlCache,
          )
          await processSnapshot(dorm.id, result)

          if (!result.scrapeOk) {
            console.warn(`[CRON] Scrape soft-failed for ${dorm.slug}: ${result.errorMsg}`)
            errors++
            byProvider[providerKey].errors++
          } else {
            scraped++
            byProvider[providerKey].scraped++
          }
        } catch (err) {
          console.error(`[CRON] Unhandled error for ${dorm.slug}:`, err)
          errors++
          byProvider[providerKey].errors++
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
    skipped,
    byProvider,
    duration_ms: Date.now() - start,
  })
}
