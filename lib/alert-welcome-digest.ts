import 'server-only'
import { dormMatchesAlert } from './alert-criteria'
import { getAvailabilityStatusBulk, availabilityMapToRecord } from './availability'
import { sendWelcomeDigest } from './email'
import { createAdminClient } from './supabase/admin'
import type { Dorm } from './types/dorm'
import type { AlertPayload } from '@/app/[locale]/dashboard/alerts/actions'

const MAX_DORMS = 5

export async function maybeSendWelcomeDigest({
  userEmail,
  alertId,
  criteria,
  locale,
}: {
  userEmail: string
  alertId: string
  criteria: Pick<
    AlertPayload,
    'price_max' | 'districts' | 'deposit_max' | 'pets_required' | 'couples' | 'notify_email'
  >
  locale: string
}): Promise<{ sent: boolean; error?: string }> {
  if (!criteria.notify_email) return { sent: false }

  const admin = createAdminClient()
  const { data: dormData } = await admin.from('dorms').select('*').eq('active', true)
  const dorms = (dormData ?? []) as Dorm[]
  if (dorms.length === 0) return { sent: false }

  const availabilityMap = await getAvailabilityStatusBulk(
    dorms.map((d) => d.id),
    admin,
  )
  const availability = availabilityMapToRecord(availabilityMap)

  const alertCriteria = {
    price_max: criteria.price_max,
    districts: criteria.districts.length > 0 ? criteria.districts : null,
    deposit_max: criteria.deposit_max,
    pets_required: criteria.pets_required,
    couples: criteria.couples,
  }

  const matchingAvailable = dorms.filter(
    (dorm) =>
      availability[dorm.id]?.status === 'available' &&
      dormMatchesAlert(dorm, alertCriteria),
  )

  if (matchingAvailable.length === 0) return { sent: false }

  const listed = matchingAvailable.slice(0, MAX_DORMS).map((dorm) => ({
    id: dorm.id,
    slug: dorm.slug,
    name: dorm.name,
    provider: dorm.provider,
    district: dorm.district,
    price_min: dorm.price_min,
    price_max: dorm.price_max,
  }))

  return sendWelcomeDigest({
    to: userEmail,
    alertId,
    locale,
    dorms: listed,
    totalAvailable: matchingAvailable.length,
  })
}
