import { describe, expect, it, vi, afterEach } from 'vitest'
import { fetchAuthProviders } from './auth-providers'

describe('fetchAuthProviders', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns google true when enabled in settings', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ external: { google: true, email: true } }),
      })),
    )

    const providers = await fetchAuthProviders(
      'https://example.supabase.co',
      'anon-key',
    )

    expect(providers).toEqual({ google: true, email: true })
  })

  it('returns google false when disabled in settings', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ external: { google: false, email: true } }),
      })),
    )

    const providers = await fetchAuthProviders(
      'https://example.supabase.co',
      'anon-key',
    )

    expect(providers.google).toBe(false)
    expect(providers.email).toBe(true)
  })

  it('falls back safely when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))

    const providers = await fetchAuthProviders(
      'https://example.supabase.co',
      'anon-key',
    )

    expect(providers.google).toBe(false)
    expect(providers.email).toBe(true)
  })
})
