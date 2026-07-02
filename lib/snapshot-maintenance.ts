import { createAdminClient } from './supabase/admin'

const KEEP_DAYS = 30

/** Remove availability snapshots older than KEEP_DAYS. Called at end of cron runs. */
export async function pruneOldSnapshots(): Promise<number> {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc('prune_old_snapshots', { p_keep_days: KEEP_DAYS })

  if (error) {
    console.error('[SNAPSHOT] Prune failed:', error.message)
    return 0
  }

  const deleted = typeof data === 'number' ? data : 0
  if (deleted > 0) {
    console.log(`[SNAPSHOT] Pruned ${deleted} row(s) older than ${KEEP_DAYS} days`)
  }
  return deleted
}
