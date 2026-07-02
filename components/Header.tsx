import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin-emails'
import DormraLogo from '@/components/DormraLogo'
import { Button } from '@/components/ui/button'
import HeaderUserMenu from './HeaderUserMenu'
import HeaderMobileMenu from './HeaderMobileMenu'
import HeaderNav from './HeaderNav'
import LanguageSwitcher from './LanguageSwitcher'

export default async function Header() {
  const t = await getTranslations('nav')
  let userEmail: string | null = null
  let showAdmin = false
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    userEmail = data.user?.email ?? null
    showAdmin = isAdminEmail(userEmail)
  } catch {
    // No Supabase env in this environment — fall back to signed-out state.
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex h-[3.75rem] max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <DormraLogo size="md" />
        </Link>

        <HeaderNav />

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:flex" />
          {userEmail ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                className="hidden h-8 rounded-full px-3 text-sm md:inline-flex"
                render={<Link href="/dashboard/alerts" />}
              >
                {t('myAlerts')}
              </Button>
              <HeaderUserMenu email={userEmail} showAdmin={showAdmin} />
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" nativeButton={false} className="h-8 rounded-full px-3 text-sm" render={<Link href="/login" />}>
                {t('logIn')}
              </Button>
              <Button size="sm" nativeButton={false} className="h-8 rounded-full px-4 text-sm" render={<Link href="/signup" />}>
                {t('signUp')}
              </Button>
            </div>
          )}
          <HeaderMobileMenu signedIn={!!userEmail} />
        </div>
      </div>
    </header>
  )
}
