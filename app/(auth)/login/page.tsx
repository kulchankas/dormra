'use client'

import { Suspense } from 'react'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
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

function LoginPageContent() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirect') ?? '/'

  const [isPending, startTransition] = useTransition()
  const [magicSending, setMagicSending] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

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
      toast.success('Signed in. Welcome back!')
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
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Check your inbox — magic link sent.')
      }
    } finally {
      setMagicSending(false)
    }
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

  async function onForgotPassword() {
    const email = getValues('email')
    const result = schema.shape.email.safeParse(email)
    if (!result.success) {
      toast.error('Enter your email above first, then click "Forgot password".')
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account`,
    })
    if (error) toast.error(error.message)
    else toast.success('Password reset link sent.')
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your alerts and saved dorms.
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
          or with email
        </span>
      </div>

      <form onSubmit={handleSubmit(onPasswordLogin)} className="space-y-4" noValidate>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:underline focus-visible:outline-none"
            >
              Forgot?
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
          disabled={isPending || magicSending || oauthLoading}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <KeyRound className="size-4" />
          )}
          Sign in
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-11 w-full gap-2 rounded-xl text-sm text-muted-foreground hover:text-foreground"
          onClick={onMagicLink}
          disabled={isPending || magicSending || oauthLoading}
        >
          {magicSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Mail className="size-4" />
          )}
          Send me a magic link instead
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href={`/signup${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          Sign up
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
