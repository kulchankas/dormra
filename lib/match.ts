import { createAdminClient } from './supabase/admin'
import { dormMatchesAlert } from './alert-criteria'
import type { DormForAlertMatching } from './types/dorm'

interface MatchingAlert {
  id: string
  user_id: string
  notify_email: boolean
  locale: string
}

export { dormMatchesAlert, type AlertCriteria } from './alert-criteria'

// move_in_before is stored on user_alerts and shown in the UI, but we do not match
// on it yet — providers do not expose structured move-in dates in scraped data.
// See README "Implemented vs planned" matrix.

export async function matchAlertsForDorm(dorm: DormForAlertMatching): Promise<MatchingAlert[]> {
  const admin = createAdminClient()

  const { data: alerts, error } = await admin
    .from('user_alerts')
    .select('id, user_id, price_max, districts, pets_required, couples, deposit_max, notify_email, locale')
    .eq('active', true)
    .eq('notify_email', true)

  if (error || !alerts) {
    console.error('[MATCH] Failed to fetch alerts:', error?.message)
    return []
  }

  const matched: MatchingAlert[] = []

  for (const alert of alerts) {
    if (!alert.user_id) continue
    if (!dormMatchesAlert(dorm, alert)) continue

    matched.push({
      id: alert.id,
      user_id: alert.user_id,
      notify_email: alert.notify_email,
      locale: alert.locale ?? 'en',
    })
  }

  return matched
}

export async function getUserEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.getUserById(userId)
  if (error || !data?.user?.email) {
    console.error(`[MATCH] Could not fetch email for user ${userId.slice(0, 8)}***:`, error?.message)
    return null
  }
  return data.user.email
}
