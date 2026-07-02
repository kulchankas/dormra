/** Cheerio providers — complete in seconds on Vercel. */
export const FAST_CRON_PROVIDERS = ['stuwo', 'home4students'] as const

export type CronScrapeParams = {
  providers: string[]
  batch: number | null
  batches: number | null
  prune: boolean
}

export function parseCronScrapeParams(searchParams: URLSearchParams): CronScrapeParams | { error: string } {
  const providersRaw =
    searchParams.get('providers') ?? searchParams.get('provider') ?? FAST_CRON_PROVIDERS.join(',')

  const providers = providersRaw
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)

  if (providers.length === 0) {
    return { error: 'At least one provider is required' }
  }

  const batchRaw = searchParams.get('batch')
  const batchesRaw = searchParams.get('batches')
  const hasBatch = batchRaw !== null
  const hasBatches = batchesRaw !== null

  if (hasBatch !== hasBatches) {
    return { error: 'batch and batches must both be set or both omitted' }
  }

  let batch: number | null = null
  let batches: number | null = null

  if (hasBatch && hasBatches) {
    batch = Number(batchRaw)
    batches = Number(batchesRaw)
    if (!Number.isInteger(batch) || !Number.isInteger(batches) || batches < 1 || batch < 0 || batch >= batches) {
      return { error: 'Invalid batch/batches (need 0 <= batch < batches)' }
    }
    if (providers.length !== 1) {
      return { error: 'batch/batches only supported with a single provider' }
    }
  }

  const prune = searchParams.get('prune') === '1'

  return { providers, batch, batches, prune }
}

/** Split a list into N sequential batches (batch 0 … batches-1). */
export function sliceForBatch<T>(items: T[], batch: number, batches: number): T[] {
  const size = Math.ceil(items.length / batches)
  const start = batch * size
  return items.slice(start, start + size)
}

export function providerSortKey(providerKey: string, usesBrowser: (p: string) => boolean): number {
  return usesBrowser(providerKey) ? 1 : 0
}
