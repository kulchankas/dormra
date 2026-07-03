'use client'

import { useEffect, useState } from 'react'

import { fetchAuthProviders } from '@/lib/auth-providers'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { Separator } from '@/components/ui/separator'

type AuthSocialLoginProps = {
  redirectTo?: string
  disabled?: boolean
  dividerLabel: string
}

export function AuthSocialLogin({
  redirectTo = '/',
  disabled = false,
  dividerLabel,
}: AuthSocialLoginProps) {
  const [googleEnabled, setGoogleEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchAuthProviders().then((providers) => {
      if (!cancelled) setGoogleEnabled(providers.google)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (googleEnabled !== true) {
    return null
  }

  return (
    <>
      <GoogleSignInButton redirectTo={redirectTo} disabled={disabled} />

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-background px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          {dividerLabel}
        </span>
      </div>
    </>
  )
}
