'use client'

import { LogOut, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFormStatus } from 'react-dom'
import { signOutAction } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

function SignOutPendingIcon() {
  const { pending } = useFormStatus()
  if (pending) {
    return <Loader2 className="size-4 animate-spin" aria-hidden />
  }
  return <LogOut className="size-4" aria-hidden />
}

type SignOutButtonProps = {
  className?: string
  size?: 'sm' | 'lg'
  fullWidth?: boolean
}

export default function SignOutButton({
  className,
  size = 'lg',
  fullWidth = false,
}: SignOutButtonProps) {
  const t = useTranslations('nav')

  return (
    <form action={signOutAction}>
      <Button
        type="submit"
        variant="outline"
        size={size}
        className={cn(
          'gap-2 rounded-xl text-sm',
          fullWidth && 'h-11 w-full',
          size === 'sm' && 'h-9 rounded-full px-4',
          className,
        )}
      >
        <SignOutPendingIcon />
        {t('signOut')}
      </Button>
    </form>
  )
}

export function SignOutMenuItem() {
  const t = useTranslations('nav')

  return (
    <form action={signOutAction} className="contents">
      <DropdownMenuItem
        variant="destructive"
        nativeButton={false}
        render={<button type="submit" />}
      >
        <SignOutPendingIcon />
        {t('signOut')}
      </DropdownMenuItem>
    </form>
  )
}
