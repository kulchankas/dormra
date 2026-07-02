import { createAdminClient } from './supabase/admin'
import { matchAlertsForDorm, getUserEmail } from './match'
import { sendAvailabilityAlert } from './email'
import { isNewlyAvailableTransition } from './availability-transition'
import type { ScraperResult } from '@/scrapers/types'

export async function processSnapshot(dormId: string, result: ScraperResult): Promise<void> {
  // Snapshot writes use the service-role client so they bypass RLS. Once RLS is
  // enabled (supabase/migrations/20260605120000_enable_rls.sql), the anon key
  // has no insert policy on availability_snapshots — only the cron, via the
  // service role, may write.
  const db = createAdminClient()

  const { data: inserted, error: insertError } = await db
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
    .single()

  if (insertError || !inserted) {
    console.error(`[SNAPSHOT] Insert failed for dorm ${dormId}:`, insertError?.message)
    return
  }

  // A failed scrape carries no signal about availability. Never alert on it.
  if (!result.scrapeOk) return

  const { data: previous } = await db
    .from('availability_snapshots')
    .select('available, scraped_at')
    .eq('dorm_id', dormId)
    .eq('scrape_ok', true)
    .lt('scraped_at', inserted.scraped_at)
    .order('scraped_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // No prior successful snapshot — first observation; don't blast every alert.
  if (!previous) return

  if (isNewlyAvailableTransition(previous, result)) {
    console.log(`[DIFF] ${dormId} became available — fetching dorm and matching alerts`)
    await sendAlertsForDorm(dormId, inserted.id)
  }
}

export async function sendAlertsForDorm(
  dormId: string,
  snapshotId: string,
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
      // Dedup: one email per user+dorm per week (alert_log has no alert_id column).
      const { data: existing } = await admin
        .from('alert_log')
        .select('id')
        .eq('user_id', alert.user_id)
        .eq('dorm_id', dormId)
        .gte('sent_at', sevenDaysAgo)
        .limit(1)
        .maybeSingle()

      if (existing) {
        console.log(`[DIFF] User ${alert.user_id.slice(0, 8)} already notified for ${dorm.slug} — skipping`)
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
        await admin.from('alert_log').insert({
          user_id: alert.user_id,
          dorm_id: dormId,
          sent_at: new Date().toISOString(),
          channel: 'email',
          snapshot_id: snapshotId,
        })
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
