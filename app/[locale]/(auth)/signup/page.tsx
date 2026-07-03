'use client'

import { Suspense, useMemo, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation'
import { AuthSocialLogin } from '@/components/AuthSocialLogin'
import { createClient } from '@/lib/supabase/client'
import { buildAuthCallbackUrl } from '@/lib/auth-callback-url'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

function SignupPageContent() {
  const t = useTranslations('auth')
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirect') ?? '/'

  const [isPending, startTransition] = useTransition()

  const schema = useMemo(
    () =>
      z
        .object({
          email: z.string().email(t('emailInvalid')),
          password: z.string().min(8, t('passwordMin')),
          confirm: z.string(),
          consent: z.boolean().refine((v) => v === true, {
            message: t('consentRequired'),
          }),
        })
        .refine((data) => data.password === data.confirm, {
          message: t('passwordsMismatch'),
          path: ['confirm'],
        }),
    [t],
  )

  type FormValues = z.infer<typeof schema>

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', confirm: '', consent: false },
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = form

  const consent = useWatch({ control, name: 'consent' })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: buildAuthCallbackUrl(redirectTo),
        },
      })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success(t('signupSuccessInbox'))
      router.replace('/login')
    })
  }

  const loginHref =
    redirectTo !== '/'
      ? { pathname: '/login' as const, query: { redirect: redirectTo } }
      : '/login'

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          {t('signupTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('signupSubtitle')}</p>
      </header>

      <AuthSocialLogin
        redirectTo={redirectTo}
        disabled={isPending}
        dividerLabel={t('orSignUpWithEmail')}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={t('passwordPlaceholder')}
            aria-invalid={!!errors.password}
            className="h-11 rounded-xl"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">{t('confirmPassword')}</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder={t('confirmPasswordPlaceholder')}
            aria-invalid={!!errors.confirm}
            className="h-11 rounded-xl"
            {...register('confirm')}
          />
          {errors.confirm && (
            <p className="text-xs text-destructive">{errors.confirm.message}</p>
          )}
        </div>

        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
          <Checkbox
            checked={!!consent}
            onCheckedChange={(v) => setValue('consent', v === true, { shouldValidate: true })}
            className="mt-0.5"
            aria-invalid={!!errors.consent}
          />
          <span>
            {t('consentPrefix')}{' '}
            <Link href="/terms" className="text-brand underline-offset-4 hover:underline">
              {t('termsLink')}
            </Link>{' '}
            {t('and')}{' '}
            <Link href="/privacy" className="text-brand underline-offset-4 hover:underline">
              {t('privacyLink')}
            </Link>
            .
          </span>
        </label>
        {errors.consent && (
          <p className="-mt-2 text-xs text-destructive">{errors.consent.message}</p>
        )}

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full gap-2 rounded-xl text-sm"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          {t('createAccount')}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link href={loginHref} className="font-medium text-brand underline-offset-4 hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageContent />
    </Suspense>
  )
}
