import type { NextRequest } from 'next/server'
import { authorizeCronRequest } from '@/lib/cron-auth'
import { isAdminEmail } from '@/lib/admin-emails'
import { createAdminClient } from '@/lib/supabase/admin'
import { matchAlertsForDorm } from '@/lib/match'
import { sendAlertsForDorm } from '@/lib/diff'
import { sendAvailabilityAlert } from '@/lib/email'

export const maxDuration = 60

type DormRow = {
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

async function fetchDorm(slug: string): Promise<DormRow | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('dorms')
    .select(
      'id, slug, name, provider, address, district, price_min, price_max, pets, couples, deposit_months, apply_url',
    )
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle()

  if (error) {
    console.error('[TEST-ALERT] Dorm lookup failed:', error.message)
    return null
  }
  return data
}

async function latestSnapshotId(dormId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('availability_snapshots')
    .select('id')
    .eq('dorm_id', dormId)
    .order('scraped_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.id ?? null
}

/** Operator E2E route — auth via CRON_SECRET (same as cron scrape). */
export async function GET(request: NextRequest) {
  if (!authorizeCronRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const slug = request.nextUrl.searchParams.get('slug')?.trim()
  if (!slug) {
    return Response.json({ ok: false, error: 'Missing slug query param' }, { status: 400 })
  }

  const dorm = await fetchDorm(slug)
  if (!dorm) {
    return Response.json({ ok: false, error: `Active dorm not found: ${slug}` }, { status: 404 })
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1'
  const sendAll = request.nextUrl.searchParams.get('send') === '1'
  const testEmail = request.nextUrl.searchParams.get('email')?.trim().toLowerCase() ?? null

  const matching = await matchAlertsForDorm(dorm)

  if (dryRun) {
    return Response.json({
      ok: true,
      mode: 'dryRun',
      slug: dorm.slug,
      dormId: dorm.id,
      matched: matching.length,
      alertIds: matching.map((a) => a.id),
    })
  }

  if (testEmail) {
    if (!isAdminEmail(testEmail)) {
      return Response.json(
        { ok: false, error: 'email must be listed in ADMIN_EMAILS' },
        { status: 403 },
      )
    }

    const snapshotId = (await latestSnapshotId(dorm.id)) ?? 'test-alert-no-snapshot'
    const locale = request.nextUrl.searchParams.get('locale') ?? 'en'

    const result = await sendAvailabilityAlert({
      to: testEmail,
      userName: null,
      dorm,
      alertId: 'test-alert',
      locale,
    })

    return Response.json({
      ok: result.success,
      mode: 'adminEmail',
      slug: dorm.slug,
      dormId: dorm.id,
      to: testEmail,
      matched: matching.length,
      snapshotId,
      error: result.error,
    })
  }

  if (sendAll) {
    const snapshotId = await latestSnapshotId(dorm.id)
    if (!snapshotId) {
      return Response.json(
        { ok: false, error: 'No snapshot for dorm — run cron first or use email= for admin test' },
        { status: 400 },
      )
    }

    const result = await sendAlertsForDorm(dorm.id, snapshotId)
    return Response.json({
      ok: result.errors.length === 0,
      mode: 'sendAll',
      slug: dorm.slug,
      dormId: dorm.id,
      snapshotId,
      ...result,
    })
  }

  return Response.json({
    ok: true,
    mode: 'matchOnly',
    slug: dorm.slug,
    dormId: dorm.id,
    matched: matching.length,
    hint: 'Add dryRun=1, email=ADMIN@..., or send=1',
  })
}
