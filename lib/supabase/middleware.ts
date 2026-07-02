import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

const LOCALE_PREFIXES = ['de', 'ru'] as const

function isDashboardPath(pathname: string): boolean {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return true
  return LOCALE_PREFIXES.some(
    (locale) =>
      pathname === `/${locale}/dashboard` || pathname.startsWith(`/${locale}/dashboard/`),
  )
}

function loginRedirectUrl(request: NextRequest): URL {
  const pathname = request.nextUrl.pathname
  const locale = LOCALE_PREFIXES.find(
    (l) => pathname === `/${l}/dashboard` || pathname.startsWith(`/${l}/dashboard/`),
  )
  const prefix = locale ? `/${locale}` : ''
  const url = new URL(`${prefix}/login`, request.url)
  url.searchParams.set('redirect', pathname)
  return url
}

export async function updateSession(request: NextRequest, baseResponse?: NextResponse) {
  let response =
    baseResponse ??
    NextResponse.next({
      request,
    })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
            headers: baseResponse?.headers,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (isDashboardPath(request.nextUrl.pathname) && !user) {
    return NextResponse.redirect(loginRedirectUrl(request))
  }

  return response
}
