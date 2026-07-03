import { createAdminClient } from './supabase/admin'

export type CronRunPayload = {
  durationMs: number
  ok: boolean
  errorMessage?: string | null
  providers: string[]
  batch: number | null
  batches: number | null
  scraped: number
  errors: number
  skipped: number
  pruned: number
  byProvider: Record<string, { scraped: number; errors: number; skipped: number }>
}

export async function logCronRun(payload: CronRunPayload): Promise<void> {
  try {
    const admin = createAdminClient()
    const { error } = await admin.from('cron_runs').insert({
      duration_ms: payload.durationMs,
      ok: payload.ok,
      error_message: payload.errorMessage ?? null,
      providers: payload.providers,
      batch: payload.batch,
      batches: payload.batches,
      scraped: payload.scraped,
      errors: payload.errors,
      skipped: payload.skipped,
      pruned: payload.pruned,
      by_provider: payload.byProvider,
    })
    if (error) {
      console.error('[CRON] Failed to log cron run:', error.message)
    }
  } catch (err) {
    console.error('[CRON] Failed to log cron run:', err)
  }
}
