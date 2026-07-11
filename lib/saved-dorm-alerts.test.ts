import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockGetUserEmail = vi.fn()
const mockSendSavedDormAvailabilityEmail = vi.fn()
const mockFrom = vi.fn()

vi.mock('./supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}))

vi.mock('./match', () => ({
  getUserEmail: (...args: unknown[]) => mockGetUserEmail(...args),
}))

vi.mock('./email', () => ({
  sendSavedDormAvailabilityEmail: (...args: unknown[]) => mockSendSavedDormAvailabilityEmail(...args),
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

type QueryResult = { data: unknown; error: unknown }

function makeQuery(result: QueryResult | (() => QueryResult | Promise<QueryResult>)) {
  const resolve = async () => (typeof result === 'function' ? await result() : result)
  const chain: Record<string, unknown> = {}
  for (const method of ['select', 'eq', 'gte', 'limit', 'lt', 'order']) {
    chain[method] = vi.fn(() => chain)
  }
  chain.single = vi.fn(resolve)
  chain.maybeSingle = vi.fn(resolve)
  chain.insert = vi.fn(resolve)
  chain.then = (onfulfilled: (v: QueryResult) => unknown) => resolve().then(onfulfilled)
  return chain
}

describe('sendSavedDormNotificationsForDorm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserEmail.mockResolvedValue('user@example.com')
    mockSendSavedDormAvailabilityEmail.mockResolvedValue({ success: true })
  })

  it('returns early when dorm is not found', async () => {
    mockFrom.mockImplementation(() => makeQuery({ data: null, error: { message: 'Not found' } }))

    const { sendSavedDormNotificationsForDorm } = await import('./saved-dorm-alerts')
    const result = await sendSavedDormNotificationsForDorm('missing', 'snap-1')

    expect(result).toEqual({ tracked: 0, sent: 0, errors: ['Not found'] })
    expect(mockSendSavedDormAvailabilityEmail).not.toHaveBeenCalled()
  })

  it('sends email to users who saved the dorm', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'dorms') {
        return makeQuery({ data: dorm, error: null })
      }
      if (table === 'tracker') {
        return makeQuery({ data: [{ id: 'track-1', user_id: 'user-1' }], error: null })
      }
      if (table === 'alert_log') {
        return makeQuery({ data: null, error: null })
      }
      if (table === 'user_alerts') {
        return makeQuery({ data: { locale: 'de' }, error: null })
      }
      return makeQuery({ data: null, error: null })
    })

    const { sendSavedDormNotificationsForDorm } = await import('./saved-dorm-alerts')
    const result = await sendSavedDormNotificationsForDorm('dorm-1', 'snap-1')

    expect(result).toEqual({ tracked: 1, sent: 1, errors: [] })
    expect(mockSendSavedDormAvailabilityEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        locale: 'de',
        dorm: expect.objectContaining({ slug: 'test-dorm' }),
      }),
    )
  })

  it('skips when user already received a criteria alert for this snapshot', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'dorms') {
        return makeQuery({ data: dorm, error: null })
      }
      if (table === 'tracker') {
        return makeQuery({ data: [{ id: 'track-1', user_id: 'user-1' }], error: null })
      }
      if (table === 'alert_log') {
        return makeQuery({ data: { id: 'log-1' }, error: null })
      }
      return makeQuery({ data: null, error: null })
    })

    const { sendSavedDormNotificationsForDorm } = await import('./saved-dorm-alerts')
    const result = await sendSavedDormNotificationsForDorm('dorm-1', 'snap-1')

    expect(result).toEqual({ tracked: 1, sent: 0, errors: [] })
    expect(mockSendSavedDormAvailabilityEmail).not.toHaveBeenCalled()
  })

  it('skips when saved-dorm email was sent within the last week', async () => {
    let alertLogReads = 0
    mockFrom.mockImplementation((table: string) => {
      if (table === 'dorms') {
        return makeQuery({ data: dorm, error: null })
      }
      if (table === 'tracker') {
        return makeQuery({ data: [{ id: 'track-1', user_id: 'user-1' }], error: null })
      }
      if (table === 'alert_log') {
        return makeQuery(() => {
          alertLogReads++
          if (alertLogReads === 1) return { data: null, error: null }
          return { data: { id: 'recent' }, error: null }
        })
      }
      if (table === 'user_alerts') {
        return makeQuery({ data: { locale: 'en' }, error: null })
      }
      return makeQuery({ data: null, error: null })
    })

    const { sendSavedDormNotificationsForDorm } = await import('./saved-dorm-alerts')
    const result = await sendSavedDormNotificationsForDorm('dorm-1', 'snap-1')

    expect(result).toEqual({ tracked: 1, sent: 0, errors: [] })
    expect(mockSendSavedDormAvailabilityEmail).not.toHaveBeenCalled()
  })
})
