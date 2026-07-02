import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockMatchAlertsForDorm = vi.fn()
const mockGetUserEmail = vi.fn()
const mockSendAvailabilityAlert = vi.fn()
const mockFrom = vi.fn()

vi.mock('./supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}))

vi.mock('./match', () => ({
  matchAlertsForDorm: (...args: unknown[]) => mockMatchAlertsForDorm(...args),
  getUserEmail: (...args: unknown[]) => mockGetUserEmail(...args),
}))

vi.mock('./email', () => ({
  sendAvailabilityAlert: (...args: unknown[]) => mockSendAvailabilityAlert(...args),
}))

const dorm = {
  id: 'dorm-1',
  slug: 'test-dorm',
  name: 'Test Dorm',
  provider: 'OeAD',
  address: 'Vienna',
  district: 9,
  price_min: 400,
  price_max: 500,
  pets: false,
  couples: false,
  deposit_months: 2,
  apply_url: 'https://example.com/apply',
}

function queryChain(terminal: () => Promise<unknown>) {
  const chain: Record<string, unknown> = {}
  for (const method of ['select', 'eq', 'gte', 'limit', 'lt', 'order']) {
    chain[method] = vi.fn(() => chain)
  }
  chain.single = vi.fn(terminal)
  chain.maybeSingle = vi.fn(terminal)
  chain.insert = vi.fn(terminal)
  return chain
}

describe('sendAlertsForDorm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMatchAlertsForDorm.mockResolvedValue([])
    mockGetUserEmail.mockResolvedValue('user@example.com')
    mockSendAvailabilityAlert.mockResolvedValue({ success: true })
  })

  it('returns early when dorm is not found', async () => {
    mockFrom.mockImplementation(() =>
      queryChain(async () => ({ data: null, error: { message: 'Not found' } })),
    )

    const { sendAlertsForDorm } = await import('./diff')
    const result = await sendAlertsForDorm('missing', 'snap-1')

    expect(result).toEqual({ matched: 0, sent: 0, errors: ['Not found'] })
    expect(mockMatchAlertsForDorm).not.toHaveBeenCalled()
  })

  it('sends email and logs alert when a match exists', async () => {
    mockMatchAlertsForDorm.mockResolvedValue([
      { id: 'alert-1', user_id: 'user-1', notify_email: true, locale: 'de' },
    ])

    mockFrom.mockImplementation((table: string) => {
      if (table === 'dorms') {
        return queryChain(async () => ({ data: dorm, error: null }))
      }
      if (table === 'alert_log') {
        let inserted = false
        return {
          select: vi.fn(() => queryChain(async () => ({ data: null, error: null }))),
          insert: vi.fn(async () => {
            inserted = true
            return { error: null }
          }),
          __inserted: () => inserted,
        }
      }
      return queryChain(async () => ({ data: null, error: null }))
    })

    const { sendAlertsForDorm } = await import('./diff')
    const result = await sendAlertsForDorm('dorm-1', 'snap-1')

    expect(result).toEqual({ matched: 1, sent: 1, errors: [] })
    expect(mockSendAvailabilityAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        alertId: 'alert-1',
        locale: 'de',
        dorm: expect.objectContaining({ slug: 'test-dorm' }),
      }),
    )
  })

  it('skips send when user was notified within the last week', async () => {
    mockMatchAlertsForDorm.mockResolvedValue([
      { id: 'alert-1', user_id: 'user-1', notify_email: true, locale: 'en' },
    ])

    mockFrom.mockImplementation((table: string) => {
      if (table === 'dorms') {
        return queryChain(async () => ({ data: dorm, error: null }))
      }
      if (table === 'alert_log') {
        return queryChain(async () => ({ data: { id: 'existing-log' }, error: null }))
      }
      return queryChain(async () => ({ data: null, error: null }))
    })

    const { sendAlertsForDorm } = await import('./diff')
    const result = await sendAlertsForDorm('dorm-1', 'snap-1')

    expect(result).toEqual({ matched: 1, sent: 0, errors: [] })
    expect(mockSendAvailabilityAlert).not.toHaveBeenCalled()
  })

  it('records email send failure without throwing', async () => {
    mockMatchAlertsForDorm.mockResolvedValue([
      { id: 'alert-1', user_id: 'user-1', notify_email: true, locale: 'en' },
    ])
    mockSendAvailabilityAlert.mockResolvedValue({ success: false, error: 'Rate limited' })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'dorms') {
        return queryChain(async () => ({ data: dorm, error: null }))
      }
      if (table === 'alert_log') {
        return queryChain(async () => ({ data: null, error: null }))
      }
      return queryChain(async () => ({ data: null, error: null }))
    })

    const { sendAlertsForDorm } = await import('./diff')
    const result = await sendAlertsForDorm('dorm-1', 'snap-1')

    expect(result).toEqual({ matched: 1, sent: 0, errors: ['Rate limited'] })
  })

  it('treats unique-violation on alert_log insert as dedup skip', async () => {
    mockMatchAlertsForDorm.mockResolvedValue([
      { id: 'alert-1', user_id: 'user-1', notify_email: true, locale: 'en' },
    ])

    mockFrom.mockImplementation((table: string) => {
      if (table === 'dorms') {
        return queryChain(async () => ({ data: dorm, error: null }))
      }
      if (table === 'alert_log') {
        return {
          select: vi.fn(() => queryChain(async () => ({ data: null, error: null }))),
          insert: vi.fn(async () => ({ error: { code: '23505', message: 'duplicate' } })),
        }
      }
      return queryChain(async () => ({ data: null, error: null }))
    })

    const { sendAlertsForDorm } = await import('./diff')
    const result = await sendAlertsForDorm('dorm-1', 'snap-1')

    expect(result).toEqual({ matched: 1, sent: 0, errors: [] })
    expect(mockSendAvailabilityAlert).toHaveBeenCalledOnce()
  })
})
