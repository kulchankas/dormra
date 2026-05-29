import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { scrapeHome4Students } from '@/scrapers/home4students'
import { processSnapshot } from '@/lib/diff'

const DELAY_MS = 500

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function GET(request: NextRequest) {
  // Auth guard — must match CRON_SECRET env var
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (request.headers.get('authorization') !== expected) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  let scraped = 0
  let errors = 0

  type DormRow = { id: string; slug: string; scrape_url: string | null }
  // Fetch all home4students dorms that have a scrape_url
  const { data: dorms, error: fetchError } = (await supabase
    .from('dorms')
    .select('id, slug, scrape_url')
    .eq('provider', 'home4students')
    .not('scrape_url', 'is', null)) as { data: DormRow[] | null; error: { message: string } | null }

  if (fetchError || !dorms) {
    console.error('[CRON] Failed to fetch dorms:', fetchError?.message)
    return Response.json({ ok: false, error: fetchError?.message }, { status: 500 })
  }

  for (const dorm of dorms) {
    try {
      const result = await scrapeHome4Students(dorm.slug, dorm.scrape_url as string)
      await processSnapshot(dorm.id, result)

      if (!result.scrapeOk) {
        console.warn(`[CRON] Scrape soft-failed for ${dorm.slug}: ${result.errorMsg}`)
        errors++
      } else {
        scraped++
      }
    } catch (err) {
      // Hard errors (e.g. processSnapshot DB failure) — log and continue
      console.error(`[CRON] Unhandled error for ${dorm.slug}:`, err)
      errors++
    }

    // Be polite between requests
    await delay(DELAY_MS)
  }

  return Response.json({
    ok: true,
    scraped,
    errors,
    duration_ms: Date.now() - start,
  })
}
