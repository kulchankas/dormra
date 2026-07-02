import { describe, expect, it } from 'vitest'
import { parseCronScrapeParams, sliceForBatch } from './cron-scrape-params'

describe('parseCronScrapeParams', () => {
  it('defaults to fast providers when no query params', () => {
    const result = parseCronScrapeParams(new URLSearchParams())
    expect(result).toEqual({
      providers: ['stuwo', 'home4students'],
      batch: null,
      batches: null,
      prune: false,
    })
  })

  it('parses providers list', () => {
    const result = parseCronScrapeParams(new URLSearchParams('providers=stuwo,oead'))
    expect(result).toMatchObject({ providers: ['stuwo', 'oead'] })
  })

  it('parses batch split for single provider', () => {
    const result = parseCronScrapeParams(new URLSearchParams('provider=oead&batch=1&batches=2'))
    expect(result).toEqual({
      providers: ['oead'],
      batch: 1,
      batches: 2,
      prune: false,
    })
  })

  it('rejects batch without batches', () => {
    const result = parseCronScrapeParams(new URLSearchParams('provider=oead&batch=0'))
    expect(result).toEqual({ error: 'batch and batches must both be set or both omitted' })
  })

  it('rejects batch with multiple providers', () => {
    const result = parseCronScrapeParams(new URLSearchParams('providers=stuwo,oead&batch=0&batches=2'))
    expect(result).toEqual({ error: 'batch/batches only supported with a single provider' })
  })
})

describe('sliceForBatch', () => {
  it('splits 26 items into 13 + 13', () => {
    const items = Array.from({ length: 26 }, (_, i) => i)
    expect(sliceForBatch(items, 0, 2)).toHaveLength(13)
    expect(sliceForBatch(items, 1, 2)).toHaveLength(13)
    expect([...sliceForBatch(items, 0, 2), ...sliceForBatch(items, 1, 2)]).toEqual(items)
  })
})
