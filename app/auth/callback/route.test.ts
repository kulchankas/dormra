import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockExchangeCode = vi.fn()
const mockVerifyOtp = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCode,
      verifyOtp: mockVerifyOtp,
    },
  })),
}))

describe('GET /auth/callback', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockExchangeCode.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({ error: null })
  })

  it('redirects to next path after OAuth code exchange', async () => {
    const { GET } = await import('./route')
    const request = new NextRequest(
      'http://localhost:3000/auth/callback?code=abc&next=/dashboard',
    )
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard')
    expect(mockExchangeCode).toHaveBeenCalledWith('abc')
  })

  it('blocks open redirects in next param', async () => {
    const { GET } = await import('./route')
    const request = new NextRequest(
      'http://localhost:3000/auth/callback?code=abc&next=//evil.com',
    )
    const response = await GET(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('redirects recovery tokens to reset-password', async () => {
    const { GET } = await import('./route')
    const request = new NextRequest(
      'http://localhost:3000/auth/callback?token_hash=hash&type=recovery',
    )
    const response = await GET(request)

    expect(response.headers.get('location')).toBe('http://localhost:3000/reset-password')
    expect(mockVerifyOtp).toHaveBeenCalledWith({ type: 'recovery', token_hash: 'hash' })
  })

  it('redirects to login on auth failure', async () => {
    mockExchangeCode.mockResolvedValue({ error: { message: 'invalid code' } })

    const { GET } = await import('./route')
    const request = new NextRequest('http://localhost:3000/auth/callback?code=bad')
    const response = await GET(request)

    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login?error=callback_failed',
    )
  })

  it('uses forwarded host in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const { GET } = await import('./route')
    const request = new NextRequest('http://internal/auth/callback?code=abc&next=/dashboard', {
      headers: {
        'x-forwarded-host': 'dormra.eu',
        'x-forwarded-proto': 'https',
      },
    })
    const response = await GET(request)

    expect(response.headers.get('location')).toBe('https://dormra.eu/dashboard')

    vi.unstubAllEnvs()
  })
})
