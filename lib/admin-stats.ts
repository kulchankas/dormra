import 'server-only'
import { createAdminClient } from './supabase/admin'

const STALE_MS = 6 * 60 * 60 * 1000

export type AdminOverview = {
  activeDorms: number
  availableNow: number
  scrapeFailures: number
  staleSnapshots: number
  totalAlerts: number
  activeAlerts: number
  emailsToday: number
  emailsThisWeek: number
  lastScrapedAt: string | null
  providerStats: {
    provider: string
    dorms: number
    failures: number
    lastScrapedAt: string | null
    staleCount: number
    stale: boolean
  }[]
}

export type DormHealthRow = {
  id: string
  slug: string
  name: string
  provider: string
  available: boolean | null
  scrapeOk: boolean | null
  scrapedAt: string | null
  errorMsg: string | null
  status: 'available' | 'booked' | 'unknown' | 'failed' | 'stale'
}

export type DeliveryRow = {
  id: string
  sentAt: string
  channel: string
  dormName: string
  dormSlug: string
  provider: string
  userId: string
}

export type AlertStats = {
  total: number
  active: number
  byLocale: { locale: string; count: number }[]
  createdLast7Days: number
  createdLast30Days: number
}

export type CronRunRow = {
  id: string
  startedAt: string
  durationMs: number
  ok: boolean
  errorMessage: string | null
  providers: string[]
  batch: number | null
  batches: number | null
  scraped: number
  errors: number
  skipped: number
  pruned: number
}

function snapshotStatus(
  row: { available: boolean; scrape_ok: boolean; scraped_at: string } | undefined,
  now: number,
): DormHealthRow['status'] {
  if (!row) return 'unknown'
  if (!row.scrape_ok) return 'failed'
  if (now - new Date(row.scraped_at).getTime() > STALE_MS) return 'stale'
  return row.available ? 'available' : 'booked'
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const admin = createAdminClient()
  const now = Date.now()
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: activeDorms },
    { count: totalAlerts },
    { count: activeAlerts },
    { count: emailsToday },
    { count: emailsWeek },
    { data: lastRow },
    { data: dorms },
  ] = await Promise.all([
    admin.from('dorms').select('*', { count: 'exact', head: true }).eq('active', true),
    admin.from('user_alerts').select('*', { count: 'exact', head: true }),
    admin.from('user_alerts').select('*', { count: 'exact', head: true }).eq('active', true),
    admin.from('alert_log').select('*', { count: 'exact', head: true }).gte('sent_at', dayAgo),
    admin.from('alert_log').select('*', { count: 'exact', head: true }).gte('sent_at', weekAgo),
    admin
      .from('availability_snapshots')
      .select('scraped_at')
      .order('scraped_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.from('dorms').select('id, provider').eq('active', true),
  ])

  const dormList = dorms ?? []
  const dormIds = dormList.map((d) => d.id)

  let availableNow = 0
  let scrapeFailures = 0
  let staleSnapshots = 0
  const providerMap = new Map<
    string,
    { dorms: number; failures: number; lastScrapedAt: string | null; staleCount: number }
  >()

  for (const dorm of dormList) {
    const entry = providerMap.get(dorm.provider) ?? {
      dorms: 0,
      failures: 0,
      lastScrapedAt: null,
      staleCount: 0,
    }
    entry.dorms++
    providerMap.set(dorm.provider, entry)
  }

  if (dormIds.length > 0) {
    const { data: snapshots } = await admin.rpc('get_latest_snapshots', {
      p_dorm_ids: dormIds,
    })

    for (const row of snapshots ?? []) {
      const status = snapshotStatus(row, now)
      if (status === 'available') availableNow++
      if (status === 'failed') scrapeFailures++
      if (status === 'stale') staleSnapshots++

      const dorm = dormList.find((d) => d.id === row.dorm_id)
      if (!dorm) continue

      const entry = providerMap.get(dorm.provider)!
      if (!row.scrape_ok) entry.failures++
      if (status === 'stale') entry.staleCount++
      if (
        row.scraped_at &&
        (!entry.lastScrapedAt || row.scraped_at > entry.lastScrapedAt)
      ) {
        entry.lastScrapedAt = row.scraped_at
      }
    }
  }

  const providerStats = [...providerMap.entries()]
    .map(([provider, stats]) => ({
      provider,
      ...stats,
      // Computed here (not in the admin page component) because calling
      // Date.now() during render is flagged as an impure render by
      // react-hooks/purity.
      stale: !stats.lastScrapedAt || now - new Date(stats.lastScrapedAt).getTime() > STALE_MS,
    }))
    .sort((a, b) => a.provider.localeCompare(b.provider))

  return {
    activeDorms: activeDorms ?? 0,
    availableNow,
    scrapeFailures,
    staleSnapshots,
    totalAlerts: totalAlerts ?? 0,
    activeAlerts: activeAlerts ?? 0,
    emailsToday: emailsToday ?? 0,
    emailsThisWeek: emailsWeek ?? 0,
    lastScrapedAt: lastRow?.scraped_at ?? null,
    providerStats,
  }
}

export async function getDormHealthRows(): Promise<DormHealthRow[]> {
  const admin = createAdminClient()
  const now = Date.now()

  const { data: dorms } = await admin
    .from('dorms')
    .select('id, slug, name, provider')
    .eq('active', true)
    .order('provider')
    .order('name')

  if (!dorms?.length) return []

  const dormIds = dorms.map((d) => d.id)
  const { data: snapshots } = await admin.rpc('get_latest_snapshots', {
    p_dorm_ids: dormIds,
  })

  const snapshotByDorm = new Map((snapshots ?? []).map((s) => [s.dorm_id, s]))

  const failedIds = (snapshots ?? [])
    .filter((s) => !s.scrape_ok)
    .map((s) => s.dorm_id)

  const errorByDorm = new Map<string, string>()
  if (failedIds.length > 0) {
    const { data: errors } = await admin
      .from('availability_snapshots')
      .select('dorm_id, error_msg, scraped_at')
      .in('dorm_id', failedIds)
      .eq('scrape_ok', false)
      .order('scraped_at', { ascending: false })

    for (const row of errors ?? []) {
      if (!errorByDorm.has(row.dorm_id) && row.error_msg) {
        errorByDorm.set(row.dorm_id, row.error_msg)
      }
    }
  }

  return dorms.map((dorm) => {
    const snap = snapshotByDorm.get(dorm.id)
    const status = snapshotStatus(snap, now)
    return {
      id: dorm.id,
      slug: dorm.slug,
      name: dorm.name,
      provider: dorm.provider,
      available: snap?.available ?? null,
      scrapeOk: snap?.scrape_ok ?? null,
      scrapedAt: snap?.scraped_at ?? null,
      errorMsg: errorByDorm.get(dorm.id) ?? null,
      status,
    }
  })
}

export async function getRecentDeliveries(limit = 50): Promise<DeliveryRow[]> {
  const admin = createAdminClient()

  const { data: logs } = await admin
    .from('alert_log')
    .select('id, sent_at, channel, user_id, dorm_id')
    .order('sent_at', { ascending: false })
    .limit(limit)

  if (!logs?.length) return []

  const dormIds = [...new Set(logs.map((l) => l.dorm_id))]
  const { data: dorms } = await admin
    .from('dorms')
    .select('id, name, slug, provider')
    .in('id', dormIds)

  const dormById = new Map((dorms ?? []).map((d) => [d.id, d]))

  return logs.map((log) => {
    const dorm = dormById.get(log.dorm_id)
    return {
      id: log.id,
      sentAt: log.sent_at,
      channel: log.channel,
      dormName: dorm?.name ?? 'Unknown',
      dormSlug: dorm?.slug ?? '',
      provider: dorm?.provider ?? '',
      userId: log.user_id,
    }
  })
}

export async function getAlertStats(): Promise<AlertStats> {
  const admin = createAdminClient()
  const now = Date.now()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [{ count: total }, { count: active }, { count: created7 }, { count: created30 }, { data: rows }] =
    await Promise.all([
      admin.from('user_alerts').select('*', { count: 'exact', head: true }),
      admin.from('user_alerts').select('*', { count: 'exact', head: true }).eq('active', true),
      admin.from('user_alerts').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
      admin.from('user_alerts').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo),
      admin.from('user_alerts').select('locale'),
    ])

  const localeCounts = new Map<string, number>()
  for (const row of rows ?? []) {
    const loc = row.locale ?? 'en'
    localeCounts.set(loc, (localeCounts.get(loc) ?? 0) + 1)
  }

  const byLocale = [...localeCounts.entries()]
    .map(([locale, count]) => ({ locale, count }))
    .sort((a, b) => b.count - a.count)

  return {
    total: total ?? 0,
    active: active ?? 0,
    byLocale,
    createdLast7Days: created7 ?? 0,
    createdLast30Days: created30 ?? 0,
  }
}

export async function getRecentCronRuns(limit = 10): Promise<CronRunRow[]> {
  const admin = createAdminClient()

  const { data: rows, error } = await admin
    .from('cron_runs')
    .select(
      'id, started_at, duration_ms, ok, error_message, providers, batch, batches, scraped, errors, skipped, pruned',
    )
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error || !rows) {
    if (error) console.error('[ADMIN] Failed to fetch cron runs:', error.message)
    return []
  }

  return rows.map((row) => ({
    id: row.id,
    startedAt: row.started_at,
    durationMs: row.duration_ms,
    ok: row.ok,
    errorMessage: row.error_message,
    providers: row.providers,
    batch: row.batch,
    batches: row.batches,
    scraped: row.scraped,
    errors: row.errors,
    skipped: row.skipped,
    pruned: row.pruned,
  }))
}
