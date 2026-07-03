import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

function redirectBase(request: NextRequest, origin: string): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  return process.env.NODE_ENV === 'development' || !forwardedHost
    ? origin
    : `${forwardedProto}://${forwardedHost}`
}

function safeNextPath(nextParam: string | null): string {
  const next = nextParam ?? '/'
  return next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

function createAuthClient(request: NextRequest, response: NextResponse) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const base = redirectBase(request, origin)
  const next = safeNextPath(searchParams.get('next'))

  const oauthError = searchParams.get('error')
  if (oauthError) {
    const description = searchParams.get('error_description')
    const message = description
      ? `${oauthError}: ${description}`
      : oauthError
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(message)}`,
    )
  }

  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  if (code) {
    const response = NextResponse.redirect(`${base}${next}`)
    const supabase = createAuthClient(request, response)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return response
  } else if (tokenHash && type) {
    const destination =
      type === 'recovery' ? `${base}/reset-password` : `${base}${next}`
    const response = NextResponse.redirect(destination)
    const supabase = createAuthClient(request, response)
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return response
  }

  return NextResponse.redirect(`${base}/login?error=callback_failed`)
}
