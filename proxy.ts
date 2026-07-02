import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'

const handleI18nRouting = createMiddleware(routing)

/** Routes that must bypass next-intl locale rewriting (API handlers, auth, metadata). */
function bypassesI18n(pathname: string): boolean {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt'
  )
}

export async function proxy(request: NextRequest) {
  if (bypassesI18n(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const intlResponse = handleI18nRouting(request)

  if (intlResponse.headers.get('location')) {
    return intlResponse
  }

  return updateSession(request, intlResponse)
}

export const config = {
  matcher: [
    '/((?!api|auth|sitemap\\.xml|robots\\.txt|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
