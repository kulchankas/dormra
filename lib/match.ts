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

export async function matchAlertsForDorm(dorm: DormForAlertMatching): Promise<MatchingAlert[]> {
  const admin = createAdminClient()

  let query = admin
    .from('user_alerts')
    .select('id, user_id, price_max, districts, pets_required, couples, deposit_max, notify_email, locale')
    .eq('active', true)
    .eq('notify_email', true)

  if (dorm.price_min != null) {
    query = query.or(`price_max.is.null,price_max.gte.${dorm.price_min}`)
  }

  if (dorm.district != null) {
    query = query.or(`districts.is.null,districts.eq.{},districts.cs.{${dorm.district}}`)
  }

  if (dorm.pets !== true) {
    query = query.eq('pets_required', false)
  }

  if (dorm.couples !== true) {
    query = query.eq('couples', false)
  }

  if (dorm.deposit_months != null) {
    query = query.or(`deposit_max.is.null,deposit_max.gte.${dorm.deposit_months}`)
  }

  const { data: alerts, error } = await query

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
