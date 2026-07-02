import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockFetchDorm = vi.fn()
const mockMatchAlerts = vi.fn()
const mockSendAlertsForDorm = vi.fn()
const mockSendAvailabilityAlert = vi.fn()
const mockLatestSnapshot = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: mockFetchDorm,
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              maybeSingle: mockLatestSnapshot,
            })),
          })),
        })),
      })),
    })),
  })),
}))

vi.mock('@/lib/match', () => ({
  matchAlertsForDorm: (...args: unknown[]) => mockMatchAlerts(...args),
}))

vi.mock('@/lib/diff', () => ({
  sendAlertsForDorm: (...args: unknown[]) => mockSendAlertsForDorm(...args),
}))

vi.mock('@/lib/email', () => ({
  sendAvailabilityAlert: (...args: unknown[]) => mockSendAvailabilityAlert(...args),
}))

describe('GET /api/test-alert', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.CRON_SECRET = 'test-cron-secret'
    process.env.ADMIN_EMAILS = 'admin@example.com'
  })

  it('returns 401 without auth', async () => {
    const { GET } = await import('./route')
    const response = await GET(new NextRequest('http://localhost/api/test-alert?slug=test'))
    expect(response.status).toBe(401)
  })

  it('returns 400 when slug missing', async () => {
    const { GET } = await import('./route')
    const response = await GET(
      new NextRequest('http://localhost/api/test-alert', {
        headers: { authorization: 'Bearer test-cron-secret' },
      }),
    )
    expect(response.status).toBe(400)
  })

  it('returns dryRun match count', async () => {
    mockFetchDorm.mockResolvedValue({
      data: { id: 'd1', slug: 'test-dorm', name: 'Test' },
      error: null,
    })
    mockMatchAlerts.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }])

    const { GET } = await import('./route')
    const response = await GET(
      new NextRequest('http://localhost/api/test-alert?slug=test-dorm&dryRun=1', {
        headers: { authorization: 'Bearer test-cron-secret' },
      }),
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.mode).toBe('dryRun')
    expect(body.matched).toBe(2)
  })

  it('rejects non-admin email override', async () => {
    mockFetchDorm.mockResolvedValue({
      data: { id: 'd1', slug: 'test-dorm', name: 'Test' },
      error: null,
    })
    mockMatchAlerts.mockResolvedValue([])

    const { GET } = await import('./route')
    const response = await GET(
      new NextRequest('http://localhost/api/test-alert?slug=test-dorm&email=stranger@evil.com', {
        headers: { authorization: 'Bearer test-cron-secret' },
      }),
    )
    expect(response.status).toBe(403)
  })

  it('sends admin test email', async () => {
    mockFetchDorm.mockResolvedValue({
      data: { id: 'd1', slug: 'test-dorm', name: 'Test' },
      error: null,
    })
    mockMatchAlerts.mockResolvedValue([])
    mockLatestSnapshot.mockResolvedValue({ data: { id: 'snap-1' }, error: null })
    mockSendAvailabilityAlert.mockResolvedValue({ success: true })

    const { GET } = await import('./route')
    const response = await GET(
      new NextRequest('http://localhost/api/test-alert?slug=test-dorm&email=admin@example.com', {
        headers: { authorization: 'Bearer test-cron-secret' },
      }),
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.mode).toBe('adminEmail')
    expect(body.ok).toBe(true)
    expect(mockSendAvailabilityAlert).toHaveBeenCalled()
  })
})
