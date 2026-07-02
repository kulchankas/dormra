'use client'

import { Suspense, useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

import { Link, useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function ResetPasswordContent() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  const schema = useMemo(
    () =>
      z
        .object({
          password: z.string().min(8, t('passwordMin')),
          confirm: z.string(),
        })
        .refine((data) => data.password === data.confirm, {
          message: t('passwordsMismatch'),
          path: ['confirm'],
        }),
    [t],
  )

  type FormValues = z.infer<typeof schema>

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session)
    })
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        toast.error(t('resetSessionExpired'))
        return
      }

      const { error } = await supabase.auth.updateUser({ password: values.password })
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success(t('passwordUpdated'))
      router.replace('/login')
    })
  }

  if (hasSession === null) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{t('resetSessionExpired')}</p>
        <Button nativeButton={false} render={<Link href="/login" />} className="rounded-full">
          {t('signIn')}
        </Button>
      </div>
    )
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          {t('resetPasswordTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('resetPasswordSubtitle')}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t('newPassword')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="h-11 rounded-xl"
            aria-invalid={!!errors.password}
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
            className="h-11 rounded-xl"
            aria-invalid={!!errors.confirm}
            {...register('confirm')}
          />
          {errors.confirm && (
            <p className="text-xs text-destructive">{errors.confirm.message}</p>
          )}
        </div>

        <Button type="submit" size="lg" className="h-11 w-full gap-2 rounded-xl text-sm" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
          {t('updatePassword')}
        </Button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  )
}
