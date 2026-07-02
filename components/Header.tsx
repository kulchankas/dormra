import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import HeaderUserMenu from './HeaderUserMenu'
import HeaderMobileMenu from './HeaderMobileMenu'
import HeaderNav from './HeaderNav'

export default async function Header() {
  let userEmail: string | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    userEmail = data.user?.email ?? null
  } catch {
    // No Supabase env in this environment — fall back to signed-out state.
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-medium text-brand transition-opacity hover:opacity-90"
        >
          <span className="grid size-7 place-items-center rounded-md bg-brand text-brand-foreground">
            <Sparkles className="size-3.5" aria-hidden="true" />
          </span>
          Dormra
        </Link>

        <HeaderNav />

        <div className="flex items-center gap-2">
          {userEmail ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                className="hidden h-8 rounded-full px-3 text-sm md:inline-flex"
                render={<Link href="/dashboard/alerts" />}
              >
                My alerts
              </Button>
              <HeaderUserMenu email={userEmail} />
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" nativeButton={false} className="h-8 rounded-full px-3 text-sm" render={<Link href="/login" />}>
                Log in
              </Button>
              <Button size="sm" nativeButton={false} className="h-8 rounded-full px-4 text-sm" render={<Link href="/signup" />}>
                Sign up
              </Button>
            </div>
          )}
          <HeaderMobileMenu signedIn={!!userEmail} />
        </div>
      </div>
    </header>
  )
}
