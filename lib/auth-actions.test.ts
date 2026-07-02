import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockSignOut = vi.fn()
const mockRedirect = vi.fn()
const mockRevalidatePath = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signOut: mockSignOut,
    },
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn(async () => 'de'),
}))

vi.mock('@/i18n/navigation', () => ({
  redirect: mockRedirect,
}))

describe('signOutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
  })

  it('signs out globally, revalidates layout, and redirects home', async () => {
    const { signOutAction } = await import('./auth-actions')

    await expect(signOutAction()).rejects.toThrow('NEXT_REDIRECT')

    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'global' })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(mockRedirect).toHaveBeenCalledWith({ href: '/', locale: 'de' })
  })
})
