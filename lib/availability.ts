import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { supabase } from './supabase'

export type AvailabilityStatus = {
  status: 'available' | 'fully_booked' | 'unknown'
  label: string
}

const UNKNOWN: AvailabilityStatus = { status: 'unknown', label: 'Status unknown' }
const STALE_MS = 6 * 60 * 60 * 1000

type SnapshotRow = Pick<
  Database['public']['Tables']['availability_snapshots']['Row'],
  'dorm_id' | 'available' | 'scrape_ok' | 'scraped_at'
>

type DbClient = SupabaseClient<Database>

export async function getAvailabilityStatusBulk(
  dormIds: string[],
  db: DbClient = supabase,
): Promise<Map<string, AvailabilityStatus>> {
  const map = new Map<string, AvailabilityStatus>()
  if (dormIds.length === 0) return map

  const { data, error } = await db
    .from('availability_snapshots')
    .select('dorm_id, available, scrape_ok, scraped_at')
    .in('dorm_id', dormIds)
    .order('scraped_at', { ascending: false })

  if (error || !data) return map

  const rows = data as SnapshotRow[]
  const now = Date.now()
  for (const row of rows) {
    if (map.has(row.dorm_id)) continue

    const stale = now - new Date(row.scraped_at).getTime() > STALE_MS
    if (stale || !row.scrape_ok) {
      map.set(row.dorm_id, UNKNOWN)
      continue
    }
    map.set(
      row.dorm_id,
      row.available
        ? { status: 'available', label: 'Available' }
        : { status: 'fully_booked', label: 'Fully booked' },
    )
  }

  return map
}

export function availabilityMapToRecord(
  map: Map<string, AvailabilityStatus>,
): Record<string, AvailabilityStatus> {
  return Object.fromEntries(map)
}
