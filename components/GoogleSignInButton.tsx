'use client'

import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import { buildAuthCallbackUrl } from '@/lib/auth-callback-url'
import { Button } from '@/components/ui/button'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.3 9.14 5.38 12 5.38Z" />
  </svg>
)

type GoogleSignInButtonProps = {
  redirectTo?: string
  disabled?: boolean
}

export function GoogleSignInButton({
  redirectTo = '/',
  disabled = false,
}: GoogleSignInButtonProps) {
  const t = useTranslations('auth')
  const [loading, setLoading] = useState(false)

  async function onGoogle() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: buildAuthCallbackUrl(redirectTo),
          skipBrowserRedirect: true,
        },
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (data.url) {
        window.location.assign(data.url)
        return
      }

      toast.error(t('googleUnavailable'))
      setLoading(false)
    } catch {
      toast.error(t('genericError'))
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="h-11 w-full gap-2 rounded-xl text-sm"
      onClick={onGoogle}
      disabled={disabled || loading}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
      {t('continueGoogle')}
    </Button>
  )
}
