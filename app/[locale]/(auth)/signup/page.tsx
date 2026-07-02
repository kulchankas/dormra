'use client'

import { Suspense } from 'react'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

const schema = z
  .object({
    email: z.string().email('Enter a valid email address.'),
    password: z.string().min(8, 'At least 8 characters.'),
    confirm: z.string(),
    consent: z.boolean().refine((v) => v === true, {
      message: 'You must accept the terms to continue.',
    }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match.",
    path: ['confirm'],
  })

type FormValues = z.infer<typeof schema>

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.3 9.14 5.38 12 5.38Z" />
  </svg>
)

function SignupPageContent() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirect') ?? '/'

  const [isPending, startTransition] = useTransition()
  const [oauthLoading, setOauthLoading] = useState(false)

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
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success('Check your inbox to confirm your email.')
      router.replace('/login')
    })
  }

  async function onGoogle() {
    setOauthLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      })
      if (error) {
        toast.error(error.message)
        setOauthLoading(false)
      }
    } catch {
      setOauthLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Save searches, get alerts, track applications — free while in beta.
        </p>
      </header>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full gap-2 rounded-xl text-sm"
        onClick={onGoogle}
        disabled={oauthLoading || isPending}
      >
        {oauthLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </Button>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          or sign up with email
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={!!errors.password}
            className="h-11 rounded-xl"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter the password"
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
            I agree to the{' '}
            <Link href="/terms" className="text-brand underline-offset-4 hover:underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-brand underline-offset-4 hover:underline">
              Privacy Policy
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
          disabled={isPending || oauthLoading}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={`/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          Sign in
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
