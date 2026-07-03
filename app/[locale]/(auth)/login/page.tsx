'use client'

import { Suspense, useEffect, useMemo, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation'
import { AuthSocialLogin } from '@/components/AuthSocialLogin'
import { createClient } from '@/lib/supabase/client'
import { buildAuthCallbackUrl } from '@/lib/auth-callback-url'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function LoginPageContent() {
  const t = useTranslations('auth')
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirect') ?? '/'

  const [isPending, startTransition] = useTransition()
  const [magicSending, setMagicSending] = useState(false)

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('emailInvalid')),
        password: z.string().min(8, t('passwordMin')),
      }),
    [t],
  )

  type FormValues = z.infer<typeof schema>

  useEffect(() => {
    const code = params.get('error')
    if (!code) return
    toast.error(code === 'callback_failed' ? t('callbackFailed') : decodeURIComponent(code))
  }, [params, t])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = form

  function onPasswordLogin(values: FormValues) {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword(values)
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success(t('signedIn'))
      router.replace(redirectTo)
      router.refresh()
    })
  }

  async function onMagicLink() {
    const email = getValues('email')
    const result = schema.shape.email.safeParse(email)
    if (!result.success) {
      form.setError('email', { message: result.error.issues[0]?.message })
      return
    }
    setMagicSending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: buildAuthCallbackUrl(redirectTo),
        },
      })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success(t('magicLinkSentInbox'))
      }
    } finally {
      setMagicSending(false)
    }
  }

  async function onForgotPassword() {
    const email = getValues('email')
    const result = schema.shape.email.safeParse(email)
    if (!result.success) {
      toast.error(t('forgotPasswordHint'))
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildAuthCallbackUrl('/reset-password'),
    })
    if (error) toast.error(error.message)
    else toast.success(t('passwordResetSent'))
  }

  const signupHref =
    redirectTo !== '/'
      ? { pathname: '/signup' as const, query: { redirect: redirectTo } }
      : '/signup'

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          {t('loginTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('loginSubtitle')}</p>
      </header>

      <AuthSocialLogin
        redirectTo={redirectTo}
        disabled={isPending || magicSending}
        dividerLabel={t('orWithEmail')}
      />

      <form onSubmit={handleSubmit(onPasswordLogin)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@uni.ac.at"
            aria-invalid={!!errors.email}
            className="h-11 rounded-xl"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('password')}</Label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {t('forgotPassword')}
            </button>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            className="h-11 rounded-xl"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full gap-2 rounded-xl text-sm"
          disabled={isPending || magicSending}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <KeyRound className="size-4" />
          )}
          {t('signIn')}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-11 w-full gap-2 rounded-xl text-sm text-muted-foreground hover:text-foreground"
          onClick={onMagicLink}
          disabled={isPending || magicSending}
        >
          {magicSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Mail className="size-4" />
          )}
          {t('sendMagicLinkInstead')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link href={signupHref} className="font-medium text-brand underline-offset-4 hover:underline">
          {t('signUp')}
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  )
}
