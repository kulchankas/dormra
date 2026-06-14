import { createAdminClient } from './supabase/admin'
import { matchAlertsForDorm, getUserEmail } from './match'
import { sendAvailabilityAlert } from './email'
import type { ScraperResult } from '@/scrapers/types'

type InsertedRow = { id: string; scraped_at: string }
type PreviousRow = { available: boolean; scraped_at: string }

export async function processSnapshot(dormId: string, result: ScraperResult): Promise<void> {
  // Snapshot writes use the service-role client so they bypass RLS. Once RLS is
  // enabled (supabase/migrations/20260605120000_enable_rls.sql), the anon key
  // has no insert policy on availability_snapshots — only the cron, via the
  // service role, may write. The previous-snapshot read also goes through it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // 1. Insert the new snapshot (regardless of scrape_ok — we always record what happened)
  const { data: inserted, error: insertError } = (await db
    .from('availability_snapshots')
    .insert({
      dorm_id: dormId,
      available: result.available,
      rooms_count: result.roomsCount,
      raw_text: result.rawText,
      scrape_ok: result.scrapeOk,
      error_msg: result.errorMsg,
    })
    .select('id, scraped_at')
    .single()) as { data: InsertedRow | null; error: { message: string } | null }

  if (insertError || !inserted) {
    console.error(`[SNAPSHOT] Insert failed for dorm ${dormId}:`, insertError?.message)
    return
  }

  // BUG FIX (audit P0 — recovery false-positive):
  // A failed scrape carries no signal about availability. Never alert on it.
  if (!result.scrapeOk) return

  // 2. Fetch the most recent *successful* prior snapshot for comparison.
  // BUG FIX (audit P0 — recovery false-positive): filter scrape_ok=true so we
  // don't read a failure row (which is stored as available=false) as the
  // "previous" state and then interpret recovery as a transition.
  const { data: previous } = (await db
    .from('availability_snapshots')
    .select('available, scraped_at')
    .eq('dorm_id', dormId)
    .eq('scrape_ok', true)
    .lt('scraped_at', inserted.scraped_at)
    .order('scraped_at', { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: PreviousRow | null; error: unknown }

  // BUG FIX (audit P0 — first-scrape blast):
  // If we have no prior *successful* snapshot, this is effectively the first
  // observation of this dorm. Don't blast every matching alert — we have
  // nothing to compare against.
  if (!previous) return

  // 3. Detect newly-available transitions: previous was false, current is true.
  const wasUnavailable = previous.available === false
  if (wasUnavailable && result.available) {
    console.log(`[DIFF] ${dormId} became available — fetching dorm and matching alerts`)
    await sendAlertsForDorm(dormId)
  }
}

export async function sendAlertsForDorm(
  dormId: string,
): Promise<{ matched: number; sent: number; errors: string[] }> {
  const admin = createAdminClient()

  const { data: dorm, error: dormError } = await admin
    .from('dorms')
    .select('id, slug, name, provider, address, district, price_min, price_max, pets, couples, deposit_months, apply_url')
    .eq('id', dormId)
    .single()

  if (dormError || !dorm) {
    console.error(`[DIFF] Could not fetch dorm ${dormId}:`, dormError?.message)
    return { matched: 0, sent: 0, errors: [dormError?.message ?? 'Dorm not found'] }
  }

  const matchingAlerts = await matchAlertsForDorm(dorm)
  console.log(`[DIFF] ${dorm.slug}: ${matchingAlerts.length} alert(s) matched`)

  let sent = 0
  const errors: string[] = []
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  for (const alert of matchingAlerts) {
    try {
      // Dedup: skip if already sent for this alert+dorm in the last 7 days.
      // BUG FIX (audit P2): maybeSingle() — single() errors on zero rows
      // (the common, expected case for first send) and logs noise.
      const { data: existing } = await admin
        .from('alert_log')
        .select('id')
        .eq('alert_id', alert.id)
        .eq('dorm_id', dormId)
        .gte('sent_at', sevenDaysAgo)
        .limit(1)
        .maybeSingle()

      if (existing) {
        console.log(`[DIFF] Alert ${alert.id} already sent for ${dorm.slug} — skipping`)
        continue
      }

      const email = await getUserEmail(alert.user_id)
      if (!email) {
        errors.push(`No email for user ${alert.user_id.slice(0, 8)}`)
        continue
      }

      const result = await sendAvailabilityAlert({
        to: email,
        userName: null,
        dorm,
        alertId: alert.id,
      })

      if (result.success) {
        await admin
          .from('alert_log')
          .insert({ alert_id: alert.id, dorm_id: dormId, sent_at: new Date().toISOString() })
        sent++
      } else {
        errors.push(result.error ?? 'Unknown send error')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[DIFF] Error processing alert ${alert.id}:`, msg)
      errors.push(msg)
    }
  }

  console.log(`[DIFF] ${dorm.slug}: sent ${sent}/${matchingAlerts.length} email(s)`)
  return { matched: matchingAlerts.length, sent, errors }
}
