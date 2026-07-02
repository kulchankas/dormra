import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { authorizeCronRequest } from './cron-auth'

describe('authorizeCronRequest', () => {
  const originalSecret = process.env.CRON_SECRET

  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret-value'
  })

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.CRON_SECRET
    } else {
      process.env.CRON_SECRET = originalSecret
    }
  })

  it('rejects when CRON_SECRET is unset', () => {
    delete process.env.CRON_SECRET
    const req = new Request('http://localhost/api/cron/scrape', {
      headers: { authorization: 'Bearer test-secret-value' },
    })
    expect(authorizeCronRequest(req)).toBe(false)
  })

  it('rejects missing Authorization header', () => {
    const req = new Request('http://localhost/api/cron/scrape')
    expect(authorizeCronRequest(req)).toBe(false)
  })

  it('rejects wrong secret', () => {
    const req = new Request('http://localhost/api/cron/scrape', {
      headers: { authorization: 'Bearer wrong-secret' },
    })
    expect(authorizeCronRequest(req)).toBe(false)
  })

  it('accepts matching Bearer token', () => {
    const req = new Request('http://localhost/api/cron/scrape', {
      headers: { authorization: 'Bearer test-secret-value' },
    })
    expect(authorizeCronRequest(req)).toBe(true)
  })
})
