import { createAdminClient } from './supabase/admin'

interface Dorm {
  id: string
  slug: string
  name: string
  provider: string
  address: string | null
  district: number | null
  price_min: number | null
  price_max: number | null
  pets: boolean | null
  couples: boolean | null
  deposit_months: number | null
  apply_url: string | null
}

interface MatchingAlert {
  id: string
  user_id: string
  notify_email: boolean
}

export async function matchAlertsForDorm(dorm: Dorm): Promise<MatchingAlert[]> {
  const admin = createAdminClient()

  const { data: alerts, error } = await admin
    .from('user_alerts')
    .select('id, user_id, price_max, districts, pets_required, couples, deposit_max, notify_email')
    .eq('active', true)
    .eq('notify_email', true)

  if (error || !alerts) {
    console.error('[MATCH] Failed to fetch alerts:', error?.message)
    return []
  }

  const matched: MatchingAlert[] = []

  for (const alert of alerts) {
    // District filter: empty/null means all districts
    if (alert.districts && alert.districts.length > 0) {
      if (dorm.district === null || !alert.districts.includes(dorm.district)) continue
    }

    // Price filter: dorm must have room at or below the alert's max
    if (alert.price_max !== null && dorm.price_min !== null) {
      if (dorm.price_min > alert.price_max) continue
    }

    // Pets filter
    if (alert.pets_required === true && dorm.pets !== true) continue

    // Couples filter
    if (alert.couples === true && dorm.couples !== true) continue

    // Deposit filter
    if (alert.deposit_max !== null && dorm.deposit_months !== null) {
      if (dorm.deposit_months > alert.deposit_max) continue
    }

    matched.push({ id: alert.id, user_id: alert.user_id, notify_email: alert.notify_email })
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
