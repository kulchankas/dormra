import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  // OAuth / PKCE returns ?code=; email confirmation & password recovery
  // links return ?token_hash=&type=. Handle both.
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // Guard against open-redirects: only allow same-origin relative paths.
  const nextParam = searchParams.get('next') ?? '/'
  const next =
    nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/'

  // Behind a proxy (e.g. Vercel) request.url carries the internal host.
  // Prefer the forwarded host so redirects land on the public origin.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const base =
    process.env.NODE_ENV === 'development' || !forwardedHost
      ? origin
      : `${forwardedProto}://${forwardedHost}`

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${base}${next}`)
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(`${base}${next}`)
  }

  return NextResponse.redirect(`${base}/login?error=callback_failed`)
}
