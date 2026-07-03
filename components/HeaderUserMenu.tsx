'use client'

import { LayoutDashboard, Bell, Shield, Settings } from 'lucide-react'
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
import { SignOutMenuItem } from '@/components/SignOutButton'

export default function HeaderUserMenu({
  email,
  showAdmin = false,
}: {
  email: string
  showAdmin?: boolean
}) {
  const t = useTranslations('nav')
  const tDash = useTranslations('dashboard')
  const initial = email.charAt(0).toUpperCase()

  return (
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
        <DropdownMenuItem nativeButton={false} render={<Link href="/dashboard/settings" />}>
          <Settings className="size-4" />
          {t('settings')}
        </DropdownMenuItem>
        {showAdmin && (
          <DropdownMenuItem nativeButton={false} render={<Link href="/admin" />}>
            <Shield className="size-4" />
            {t('admin')}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <SignOutMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
