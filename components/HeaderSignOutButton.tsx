'use client'

import { LogOut, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFormStatus } from 'react-dom'
import { signOutAction } from '@/lib/auth-actions'
import { Button } from '@/components/ui/button'

function SignOutIcon() {
  const { pending } = useFormStatus()
  if (pending) return <Loader2 className="size-4 animate-spin" aria-hidden />
  return <LogOut className="size-4" aria-hidden />
}

export default function HeaderSignOutButton() {
  const t = useTranslations('nav')

  return (
    <form action={signOutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        className="hidden size-8 rounded-full text-muted-foreground hover:text-foreground md:inline-flex"
        aria-label={t('signOutAria')}
      >
        <SignOutIcon />
      </Button>
    </form>
  )
}
