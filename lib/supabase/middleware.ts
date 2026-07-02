import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'
import { isAdminEmail } from '@/lib/admin-emails'

const LOCALE_PREFIXES = ['de', 'ru'] as const

function isDashboardPath(pathname: string): boolean {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return true
  return LOCALE_PREFIXES.some(
    (locale) =>
      pathname === `/${locale}/dashboard` || pathname.startsWith(`/${locale}/dashboard/`),
  )
}

function isAdminPath(pathname: string): boolean {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true
  return LOCALE_PREFIXES.some(
    (locale) =>
      pathname === `/${locale}/admin` || pathname.startsWith(`/${locale}/admin/`),
  )
}

function authRedirectUrl(request: NextRequest, pathPrefix: string, redirectPath: string): URL {
  const pathname = request.nextUrl.pathname
  const locale = LOCALE_PREFIXES.find((l) => pathname.startsWith(`/${l}/`))
  const prefix = locale ? `/${locale}` : pathPrefix
  const url = new URL(`${prefix}/login`, request.url)
  url.searchParams.set('redirect', pathname)
  return url
}

function loginRedirectUrl(request: NextRequest): URL {
  return authRedirectUrl(request, '', request.nextUrl.pathname)
}

function adminLoginRedirectUrl(request: NextRequest): URL {
  return authRedirectUrl(request, '', request.nextUrl.pathname)
}

function homeRedirectUrl(request: NextRequest): URL {
  const pathname = request.nextUrl.pathname
  const locale = LOCALE_PREFIXES.find(
    (l) => pathname === `/${l}/admin` || pathname.startsWith(`/${l}/admin/`),
  )
  const prefix = locale ? `/${locale}` : ''
  return new URL(`${prefix}/`, request.url)
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

  if (isAdminPath(request.nextUrl.pathname)) {
    if (!user) {
      return NextResponse.redirect(adminLoginRedirectUrl(request))
    }
    if (!isAdminEmail(user.email)) {
      return NextResponse.redirect(homeRedirectUrl(request))
    }
  }

  if (isDashboardPath(request.nextUrl.pathname) && !user) {
    return NextResponse.redirect(loginRedirectUrl(request))
  }

  return response
}
