'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dorms', label: 'Browse dorms' },
  { href: '/dashboard/alerts', label: 'Alerts' },
  { href: '/how-it-works', label: 'How it works' },
] as const

export default function HeaderNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
      {NAV.map(({ href, label }) => {
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
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
