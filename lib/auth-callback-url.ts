import { SITE_URL } from '@/lib/i18n-path'

/** Build the OAuth / email-confirm callback URL for the current environment. */
export function buildAuthCallbackUrl(nextPath = '/'): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : SITE_URL.replace(/\/$/, '')

  const next =
    nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/'

  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`
}
