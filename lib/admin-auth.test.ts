import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { getAdminEmails, isAdminEmail } from './admin-emails'

describe('admin-emails', () => {
  const original = process.env.ADMIN_EMAILS

  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'Admin@Example.com, ops@dormra.eu'
  })

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ADMIN_EMAILS
    } else {
      process.env.ADMIN_EMAILS = original
    }
  })

  it('parses admin emails case-insensitively', () => {
    expect(getAdminEmails()).toEqual(['admin@example.com', 'ops@dormra.eu'])
  })

  it('returns false when ADMIN_EMAILS is empty', () => {
    process.env.ADMIN_EMAILS = ''
    expect(isAdminEmail('admin@example.com')).toBe(false)
  })

  it('matches allowlisted email', () => {
    expect(isAdminEmail('admin@example.com')).toBe(true)
    expect(isAdminEmail('OPS@dormra.eu')).toBe(true)
  })

  it('rejects non-admin email', () => {
    expect(isAdminEmail('stranger@example.com')).toBe(false)
    expect(isAdminEmail(null)).toBe(false)
  })
})
