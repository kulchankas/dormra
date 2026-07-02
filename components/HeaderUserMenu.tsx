'use client'

import { useRef } from 'react'
import { LogOut, LayoutDashboard, Bell } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export default function HeaderUserMenu({ email }: { email: string }) {
  const t = useTranslations('nav')
  const tDash = useTranslations('dashboard')
  const formRef = useRef<HTMLFormElement>(null)
  const initial = email.charAt(0).toUpperCase()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 rounded-full pl-1 pr-3"
              aria-label={tDash('accountMenu')}
            />
          }
        >
          <span className="grid size-6 place-items-center rounded-full bg-brand text-[11px] font-medium text-brand-foreground">
            {initial}
          </span>
          <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground sm:inline">
            {email}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {tDash('signedInAs')}
            <div className="mt-0.5 truncate text-sm font-medium text-foreground">{email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem nativeButton={false} render={<Link href="/dashboard" />}>
            <LayoutDashboard className="size-4" />
            {t('dashboard')}
          </DropdownMenuItem>
          <DropdownMenuItem nativeButton={false} render={<Link href="/dashboard/alerts" />}>
            <Bell className="size-4" />
            {t('myAlerts')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => formRef.current?.requestSubmit()}
          >
            <LogOut className="size-4" />
            {t('signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <form ref={formRef} action="/auth/signout" method="POST" className="hidden" />
    </>
  )
}
