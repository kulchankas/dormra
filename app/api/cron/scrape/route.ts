import type { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { authorizeCronRequest } from '@/lib/cron-auth'
import { parseCronScrapeParams, providerSortKey, sliceForBatch } from '@/lib/cron-scrape-params'
import { ScrapeHtmlCache } from '@/lib/scrape-html-cache'
import { getScraperForProvider, usesBrowser } from '@/scrapers'
import { launchScraperBrowser } from '@/scrapers/browser'
import { processSnapshot } from '@/lib/diff'
import { pruneOldSnapshots } from '@/lib/snapshot-maintenance'
import { logCronRun } from '@/lib/cron-runs'

export const maxDuration = 300

const DELAY_MS_BROWSER = 300
const DELAY_MS_FETCH = 0

function delay(ms: number) {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve()
}

type DormRow = {
  id: string
  slug: string
  scrape_url: string | null
  provider: string
}

export async function GET(request: NextRequest) {
  if (!authorizeCronRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = parseCronScrapeParams(request.nextUrl.searchParams)
  if ('error' in params) {
    return Response.json({ ok: false, error: params.error }, { status: 400 })
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
    await logCronRun({
      durationMs: Date.now() - start,
      ok: false,
      errorMessage: fetchError?.message ?? 'Failed to fetch dorms',
      providers: params.providers,
      batch: params.batch,
      batches: params.batches,
      scraped: 0,
      errors: 0,
      skipped: 0,
      pruned: 0,
      byProvider: {},
    })
    return Response.json({ ok: false, error: fetchError?.message }, { status: 500 })
  }

  const providerSet = new Set(params.providers)
  const filtered = dorms.filter((d) => providerSet.has(d.provider.toLowerCase()))

  const byProviderDorms = new Map<string, DormRow[]>()
  for (const dorm of filtered) {
    const key = dorm.provider.toLowerCase()
    const list = byProviderDorms.get(key) ?? []
    list.push(dorm)
    byProviderDorms.set(key, list)
  }

  const providerKeys = [...byProviderDorms.keys()].sort(
    (a, b) => providerSortKey(a, usesBrowser) - providerSortKey(b, usesBrowser),
  )

  for (const providerKey of providerKeys) {
    let providerDorms = byProviderDorms.get(providerKey) ?? []
    providerDorms = [...providerDorms].sort((a, b) => a.slug.localeCompare(b.slug))

    if (params.batch !== null && params.batches !== null) {
      providerDorms = sliceForBatch(providerDorms, params.batch, params.batches)
    }

    const scraper = getScraperForProvider(providerKey)
    byProvider[providerKey] = { scraped: 0, errors: 0, skipped: 0 }

    if (providerDorms.length === 0) {
      continue
    }

    if (!scraper) {
      console.warn(
        `[CRON] No scraper registered for provider "${providerDorms[0]?.provider}" — skipping ${providerDorms.length} dorm(s)`,
      )
      skipped += providerDorms.length
      byProvider[providerKey].skipped = providerDorms.length
      continue
    }

    const browser = usesBrowser(providerKey) ? await launchScraperBrowser() : null
    const delayMs = browser ? DELAY_MS_BROWSER : DELAY_MS_FETCH

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

        await delay(delayMs)
      }
    } finally {
      await browser?.close()
    }
  }

  const pruned = params.prune ? await pruneOldSnapshots() : 0
  const durationMs = Date.now() - start

  await logCronRun({
    durationMs,
    ok: true,
    providers: params.providers,
    batch: params.batch,
    batches: params.batches,
    scraped,
    errors,
    skipped,
    pruned,
    byProvider,
  })

  return Response.json({
    ok: true,
    scraped,
    errors,
    skipped,
    pruned,
    providers: params.providers,
    batch: params.batch,
    batches: params.batches,
    byProvider,
    duration_ms: durationMs,
  })
}
