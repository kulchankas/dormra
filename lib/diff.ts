import { createClient } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { matchAlertsForDorm, getUserEmail } from './match'
import { sendAvailabilityAlert } from './email'
import type { ScraperResult } from '@/scrapers/types'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function processSnapshot(dormId: string, result: ScraperResult): Promise<void> {
  // 1. Insert the new snapshot
  const { data: inserted, error: insertError } = await supabase
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

  // 2. Fetch the previous snapshot (the one just before the row we inserted)
  const { data: previous } = await supabase
    .from('availability_snapshots')
    .select('available, scraped_at')
    .eq('dorm_id', dormId)
    .lt('scraped_at', inserted.scraped_at)
    .order('scraped_at', { ascending: false })
    .limit(1)
    .single()

  // 3. Detect newly-available transitions
  const wasUnavailable = !previous || previous.available === false
  if (wasUnavailable && result.available) {
    console.log(`[DIFF] ${dormId} became available — fetching dorm and matching alerts`)
    await sendAlertsForDorm(dormId)
  }
}

export async function sendAlertsForDorm(dormId: string): Promise<{ matched: number; sent: number; errors: string[] }> {
  const admin = getAdminClient()

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
      // Dedup: skip if already sent for this alert+dorm in the last 7 days
      const { data: existing } = await admin
        .from('alert_log')
        .select('id')
        .eq('alert_id', alert.id)
        .eq('dorm_id', dormId)
        .gte('sent_at', sevenDaysAgo)
        .limit(1)
        .single()

      if (existing) {
        console.log(`[DIFF] Alert ${alert.id} already sent for ${dorm.slug} — skipping`)
        continue
      }

      const email = await getUserEmail(alert.user_id)
      if (!email) {
        errors.push(`No email for user ${alert.user_id.slice(0, 8)}`)
        continue
      }

      const result = await sendAvailabilityAlert({ to: email, userName: null, dorm, alertId: alert.id })

      if (result.success) {
        await admin.from('alert_log').insert({ alert_id: alert.id, dorm_id: dormId, sent_at: new Date().toISOString() })
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
