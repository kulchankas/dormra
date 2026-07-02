/** Pure provider-scrape-health logic, kept out of admin-stats.ts (which
 * imports 'server-only') so it can be unit tested directly with Vitest. */

/** Cron now runs per-provider (3 split jobs, each ~15 min) — flag a
 * provider as stale in the admin dashboard well before the lenient
 * per-dorm STALE_MS (6h) used for the public-facing availability badge,
 * so a disabled/failing cron-job.org job is caught quickly. */
export const PROVIDER_STALE_MS = 30 * 60 * 1000

export type ProviderStat = {
  provider: string
  dorms: number
  failures: number
  lastScrapedAt: string | null
  stale: boolean
}

/** Groups the latest snapshot per dorm by provider, tracking each
 * provider's most recent scrape attempt (success or failure) so a
 * stopped cron job shows up as stale even if its dorms' last known
 * status was "available". */
export function computeProviderStats(
  dormList: { id: string; provider: string }[],
  snapshots: { dorm_id: string; scrape_ok: boolean; scraped_at: string }[],
  now: number = Date.now(),
): ProviderStat[] {
  const providerMap = new Map<
    string,
    { dorms: number; failures: number; lastScrapedAt: string | null }
  >()

  for (const dorm of dormList) {
    const entry = providerMap.get(dorm.provider) ?? { dorms: 0, failures: 0, lastScrapedAt: null }
    entry.dorms++
    providerMap.set(dorm.provider, entry)
  }

  const dormById = new Map(dormList.map((d) => [d.id, d]))

  for (const row of snapshots) {
    const dorm = dormById.get(row.dorm_id)
    if (!dorm) continue
    const entry = providerMap.get(dorm.provider)
    if (!entry) continue

    if (!row.scrape_ok) entry.failures++
    if (!entry.lastScrapedAt || new Date(row.scraped_at).getTime() > new Date(entry.lastScrapedAt).getTime()) {
      entry.lastScrapedAt = row.scraped_at
    }
  }

  return [...providerMap.entries()]
    .map(([provider, stats]) => ({
      provider,
      ...stats,
      stale: stats.lastScrapedAt == null || now - new Date(stats.lastScrapedAt).getTime() > PROVIDER_STALE_MS,
    }))
    .sort((a, b) => a.provider.localeCompare(b.provider))
}
