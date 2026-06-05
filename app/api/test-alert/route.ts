import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { matchAlertsForDorm, getUserEmail } from '@/lib/match'
import { sendAvailabilityAlert } from '@/lib/email'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (request.headers.get('authorization') !== expected) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const slug = request.nextUrl.searchParams.get('dorm_slug')
  if (!slug) {
    return Response.json({ error: 'Missing ?dorm_slug= param' }, { status: 400 })
  }

  const admin = getAdminClient()

  const { data: dorm, error: dormError } = await admin
    .from('dorms')
    .select('id, slug, name, provider, address, district, price_min, price_max, pets, couples, deposit_months, apply_url')
    .eq('slug', slug)
    .single()

  if (dormError || !dorm) {
    return Response.json({ error: `Dorm not found: ${slug}` }, { status: 404 })
  }

  const matchingAlerts = await matchAlertsForDorm(dorm)
  let sent = 0
  const errors: string[] = []

  for (const alert of matchingAlerts) {
    try {
      const email = await getUserEmail(alert.user_id)
      if (!email) {
        errors.push(`No email for user ${alert.user_id.slice(0, 8)}`)
        continue
      }

      const result = await sendAvailabilityAlert({ to: email, userName: null, dorm, alertId: alert.id })

      if (result.success) {
        sent++
      } else {
        errors.push(result.error ?? 'Unknown send error')
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err))
    }
  }

  return Response.json({ matched: matchingAlerts.length, sent, errors })
}
