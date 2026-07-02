'use client'

import { useMemo, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { changePassword } from '@/lib/account-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ChangePasswordForm() {
  const t = useTranslations('settings')
  const tAuth = useTranslations('auth')
  const [isPending, startTransition] = useTransition()

  const schema = useMemo(
    () =>
      z
        .object({
          password: z.string().min(8, tAuth('passwordMin')),
          confirm: z.string(),
        })
        .refine((data) => data.password === data.confirm, {
          message: tAuth('passwordsMismatch'),
          path: ['confirm'],
        }),
    [tAuth],
  )

  type FormValues = z.infer<typeof schema>

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await changePassword(values.password)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(t('passwordUpdated'))
      form.reset()
    })
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="new-password">{tAuth('newPassword')}</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          className="h-10 rounded-xl"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">{tAuth('confirmPassword')}</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          className="h-10 rounded-xl"
          aria-invalid={!!errors.confirm}
          {...register('confirm')}
        />
        {errors.confirm && (
          <p className="text-xs text-destructive">{errors.confirm.message}</p>
        )}
      </div>

      <Button
        type="submit"
        size="sm"
        className="h-9 gap-2 rounded-full px-4"
        disabled={isPending}
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />}
        {t('updatePassword')}
      </Button>
    </form>
  )
}
