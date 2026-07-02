import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          not: vi.fn(async () => ({ data: [], error: null })),
        })),
      })),
    })),
  })),
}))

vi.mock('@/scrapers', () => ({
  getScraperForProvider: vi.fn(() => null),
  usesBrowser: vi.fn(() => false),
}))

describe('GET /api/cron/scrape', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.CRON_SECRET = 'test-cron-secret'
  })

  it('returns 401 when Authorization header is missing', async () => {
    const { GET } = await import('./route')
    const request = new NextRequest('http://localhost/api/cron/scrape')
    const response = await GET(request)
    expect(response.status).toBe(401)
  })

  it('returns 401 when Authorization header is wrong', async () => {
    const { GET } = await import('./route')
    const request = new NextRequest('http://localhost/api/cron/scrape', {
      headers: { authorization: 'Bearer wrong-secret' },
    })
    const response = await GET(request)
    expect(response.status).toBe(401)
  })

  it('returns 200 when Authorization header matches CRON_SECRET', async () => {
    const { GET } = await import('./route')
    const request = new NextRequest('http://localhost/api/cron/scrape', {
      headers: { authorization: 'Bearer test-cron-secret' },
    })
    const response = await GET(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.ok).toBe(true)
  })
})
