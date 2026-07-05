'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  de: 'DE',
  ru: 'RU',
  uk: 'UK',
}

/** Onest renders Cyrillic more cleanly than Poppins in the switcher dropdown. */
const LOCALE_ITEM_CLASS: Partial<Record<Locale, string>> = {
  ru: 'font-onest',
  uk: 'font-onest',
}

export default function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('language')
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const fullWidth = className?.includes('w-full')

  function switchLocale(next: Locale) {
    if (next !== locale) router.replace(pathname, { locale: next })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={t('switch')}
            className={cn(
              'h-8 gap-1.5 rounded-full border border-border/50 bg-surface/60 px-2.5 text-xs font-medium text-muted-foreground shadow-none hover:border-border hover:bg-surface hover:text-foreground',
              fullWidth && 'w-full justify-between px-3',
              className,
            )}
          />
        }
      >
        <span className="flex items-center gap-1.5">
          <Globe className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
          <span className="tabular-nums tracking-wide">{LOCALE_SHORT[locale]}</span>
        </span>
        <ChevronDown className="size-3.5 shrink-0 opacity-50" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10.5rem] p-1.5">
        {routing.locales.map((code) => {
          const active = code === locale
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => switchLocale(code)}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm',
                active && 'bg-brand-soft font-medium text-brand',
                LOCALE_ITEM_CLASS[code],
              )}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'w-6 text-[11px] font-semibold tabular-nums tracking-wider',
                    active ? 'text-brand/70' : 'text-muted-foreground',
                  )}
                >
                  {LOCALE_SHORT[code]}
                </span>
                <span>{t(code)}</span>
              </span>
              {active && <Check className="size-3.5 shrink-0 text-brand" aria-hidden="true" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
