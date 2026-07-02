'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dorms' as const, key: 'browseDorms' as const },
  { href: '/dashboard/alerts' as const, key: 'alerts' as const },
  { href: '/how-it-works' as const, key: 'howItWorks' as const },
]

export default function HeaderNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav aria-label={t('mainNav')} className="hidden items-center gap-1 md:flex">
      {NAV.map(({ href, key }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm transition-colors',
              active
                ? 'bg-brand-soft font-medium text-brand'
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            )}
          >
            {t(key)}
          </Link>
        )
      })}
    </nav>
  )
}
