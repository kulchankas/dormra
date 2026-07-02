'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { Menu, LogIn, UserPlus, LogOut, Bell, LayoutDashboard } from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { signOutAction } from '@/lib/auth-actions'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dorms' as const, key: 'browseDorms' as const },
  { href: '/dashboard/alerts' as const, key: 'alerts' as const },
  { href: '/how-it-works' as const, key: 'howItWorks' as const },
]

export default function HeaderMobileMenu({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label={t('openMenu')}
          />
        }
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>{t('menu')}</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-2">
          <LanguageSwitcher className="w-full" />
        </div>

        <nav className="flex flex-col gap-1 px-2" aria-label={t('mobileNav')}>
          {NAV.map(({ href, key }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <SheetClose
                key={href}
                render={
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-brand-soft font-medium text-brand'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    {t(key)}
                  </Link>
                }
              />
            )
          })}
          {signedIn && (
            <SheetClose
              render={
                <Link
                  href="/dashboard"
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    pathname === '/dashboard'
                      ? 'bg-brand-soft font-medium text-brand'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <LayoutDashboard className="size-4 text-muted-foreground" />
                  {t('dashboard')}
                </Link>
              }
            />
          )}
        </nav>

        <Separator className="my-2" />

        <div className="px-4 pb-6">
          {signedIn ? (
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="h-11 w-full gap-2 rounded-xl text-sm"
              >
                <LogOut className="size-4" />
                {t('signOut')}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <SheetClose
                render={
                  <Button
                    size="lg"
                    nativeButton={false}
                    className="h-11 w-full gap-2 rounded-xl text-sm"
                    render={<Link href="/signup?redirect=/dashboard/alerts/new" />}
                  >
                    <Bell className="size-4" />
                    {t('getAlertsFree')}
                  </Button>
                }
              />
              <SheetClose
                render={
                  <Button
                    size="lg"
                    nativeButton={false}
                    className="h-11 w-full gap-2 rounded-xl text-sm"
                    render={<Link href="/signup" />}
                  >
                    <UserPlus className="size-4" />
                    {t('signUp')}
                  </Button>
                }
              />
              <SheetClose
                render={
                  <Button
                    variant="outline"
                    size="lg"
                    nativeButton={false}
                    className="h-11 w-full gap-2 rounded-xl text-sm"
                    render={<Link href="/login" />}
                  >
                    <LogIn className="size-4" />
                    {t('logIn')}
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
