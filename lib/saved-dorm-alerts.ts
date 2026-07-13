import { createAdminClient } from './supabase/admin'
import { getUserEmail } from './match'
import { sendSavedDormAvailabilityEmail } from './email'
import type { DormAlertInfo } from './types/dorm'

const CHANNEL = 'saved_dorm'

async function getUserLocale(userId: string): Promise<string> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('user_alerts')
    .select('locale')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.locale ?? 'en'
}

export async function sendSavedDormNotificationsForDorm(
  dormId: string,
  snapshotId: string,
): Promise<{ tracked: number; sent: number; errors: string[] }> {
  const admin = createAdminClient()

  const { data: dorm, error: dormError } = await admin
    .from('dorms')
    .select('id, slug, name, provider, address, district, price_min, price_max, pets, couples, deposit_months, apply_url')
    .eq('id', dormId)
    .single()

  if (dormError || !dorm) {
    console.error(`[SAVED] Could not fetch dorm ${dormId}:`, dormError?.message)
    return { tracked: 0, sent: 0, errors: [dormError?.message ?? 'Dorm not found'] }
  }

  const { data: trackedRows, error: trackerError } = await admin
    .from('tracker')
    .select('id, user_id')
    .eq('dorm_id', dormId)

  if (trackerError) {
    console.error(`[SAVED] Could not fetch tracker rows for ${dorm.slug}:`, trackerError.message)
    return { tracked: 0, sent: 0, errors: [trackerError.message] }
  }

  const rows = trackedRows ?? []
  console.log(`[SAVED] ${dorm.slug}: ${rows.length} saved user(s)`)

  let sent = 0
  const errors: string[] = []
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  for (const row of rows) {
    try {
      const { data: criteriaEmail } = await admin
        .from('alert_log')
        .select('id')
        .eq('user_id', row.user_id)
        .eq('dorm_id', dormId)
        .eq('snapshot_id', snapshotId)
        .eq('channel', 'email')
        .limit(1)
        .maybeSingle()

      if (criteriaEmail) {
        console.log(`[SAVED] User ${row.user_id.slice(0, 8)} already got criteria alert for ${dorm.slug} — skipping`)
        continue
      }

      const { data: recentSaved } = await admin
        .from('alert_log')
        .select('id')
        .eq('user_id', row.user_id)
        .eq('dorm_id', dormId)
        .eq('channel', CHANNEL)
        .gte('sent_at', sevenDaysAgo)
        .limit(1)
        .maybeSingle()

      if (recentSaved) {
        console.log(`[SAVED] User ${row.user_id.slice(0, 8)} already notified for ${dorm.slug} this week — skipping`)
        continue
      }

      const email = await getUserEmail(row.user_id)
      if (!email) {
        errors.push(`No email for user ${row.user_id.slice(0, 8)}`)
        continue
      }

      const locale = await getUserLocale(row.user_id)
      const result = await sendSavedDormAvailabilityEmail({
        to: email,
        dorm: dorm as DormAlertInfo,
        locale,
      })

      if (result.success) {
        const { error: logError } = await admin.from('alert_log').insert({
          user_id: row.user_id,
          alert_id: null,
          dorm_id: dormId,
          sent_at: new Date().toISOString(),
          channel: CHANNEL,
          snapshot_id: snapshotId,
        })

        if (logError) {
          errors.push(logError.message)
          continue
        }
        sent++
      } else {
        errors.push(result.error ?? 'Unknown send error')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[SAVED] Error for tracker ${row.id}:`, msg)
      errors.push(msg)
    }
  }

  console.log(`[SAVED] ${dorm.slug}: sent ${sent}/${rows.length} saved-dorm email(s)`)
  return { tracked: rows.length, sent, errors }
}
