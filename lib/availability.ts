import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export type AvailabilityStatus = {
  status: 'available' | 'fully_booked' | 'unknown'
  label: string
}

const UNKNOWN: AvailabilityStatus = { status: 'unknown', label: 'Status unknown' }
const STALE_MS = 6 * 60 * 60 * 1000

type DbClient = SupabaseClient<Database>

type SnapshotRow = {
  dorm_id: string
  available: boolean
  scrape_ok: boolean
  scraped_at: string
}

function rowToStatus(row: SnapshotRow, now: number): AvailabilityStatus {
  const stale = now - new Date(row.scraped_at).getTime() > STALE_MS
  if (stale || !row.scrape_ok) return UNKNOWN
  return row.available
    ? { status: 'available', label: 'Available' }
    : { status: 'fully_booked', label: 'Fully booked' }
}

async function fetchLatestSnapshots(
  dormIds: string[],
  db: DbClient,
): Promise<SnapshotRow[]> {
  const { data, error } = await db.rpc('get_latest_snapshots', { p_dorm_ids: dormIds })

  if (!error && data) {
    return data as SnapshotRow[]
  }

  // Fallback if RPC not deployed yet
  const { data: legacy, error: legacyError } = await db
    .from('availability_snapshots')
    .select('dorm_id, available, scrape_ok, scraped_at')
    .in('dorm_id', dormIds)
    .order('scraped_at', { ascending: false })

  if (legacyError || !legacy) return []

  const rows = legacy as SnapshotRow[]
  const seen = new Set<string>()
  const latest: SnapshotRow[] = []
  for (const row of rows) {
    if (seen.has(row.dorm_id)) continue
    seen.add(row.dorm_id)
    latest.push(row)
  }
  return latest
}

export async function getAvailabilityStatusBulk(
  dormIds: string[],
  db: DbClient,
): Promise<Map<string, AvailabilityStatus>> {
  const map = new Map<string, AvailabilityStatus>()
  if (dormIds.length === 0) return map

  const rows = await fetchLatestSnapshots(dormIds, db)
  const now = Date.now()

  for (const row of rows) {
    map.set(row.dorm_id, rowToStatus(row, now))
  }

  return map
}

export function availabilityMapToRecord(
  map: Map<string, AvailabilityStatus>,
): Record<string, AvailabilityStatus> {
  return Object.fromEntries(map)
}
