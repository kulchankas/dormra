'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/admin' as const, key: 'overview' as const, exact: true },
  { href: '/admin/dorms' as const, key: 'dorms' as const, exact: false },
  { href: '/admin/reviews' as const, key: 'reviews' as const, exact: false },
  { href: '/admin/deliveries' as const, key: 'deliveries' as const, exact: false },
  { href: '/admin/alerts' as const, key: 'alerts' as const, exact: false },
]

export default function AdminNav() {
  const t = useTranslations('admin')
  const pathname = usePathname()

  return (
    <nav
      className="mb-8 flex flex-wrap gap-1 rounded-full border border-border/60 bg-surface/80 p-1"
      aria-label={t('navAria')}
    >
      {TABS.map(({ href, key, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-brand text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            {t(`tabs.${key}`)}
          </Link>
        )
      })}
    </nav>
  )
}
