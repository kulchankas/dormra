'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseAuth } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    const { error: signInError } = await supabaseAuth.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)

    if (signInError) {
      // Don't expose "User not found" vs "Wrong password" — keep it vague for security
      setError('Invalid email or password.')
      return
    }

    router.push('/dashboard')
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#FFF8F4' }}
    >
      <div
        className="w-full"
        style={{
          maxWidth: '400px',
          background: '#fff',
          border: '1px solid #FFE4D6',
          borderRadius: '16px',
          padding: '32px',
        }}
      >
        <h1 className="font-medium" style={{ fontSize: '24px', color: '#1A1410', marginBottom: '6px' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '14px', color: '#6B5C53', marginBottom: '28px' }}>
          Sign in to your Dormra account
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="login-email"
              className="block font-medium text-[13px] mb-1.5"
              style={{ color: '#1A1410' }}
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              aria-describedby={error ? 'login-error' : undefined}
              className="w-full border border-[#E5E5E5] rounded-[8px] p-3 text-[14px] outline-none focus:border-[#FF6B47] transition-colors"
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="login-password"
              className="block font-medium text-[13px] mb-1.5"
              style={{ color: '#1A1410' }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
              className="w-full border border-[#E5E5E5] rounded-[8px] p-3 text-[14px] outline-none focus:border-[#FF6B47] transition-colors"
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          {error && (
            <p id="login-error" role="alert" className="text-[13px] mb-4" style={{ color: '#C2401E' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-medium text-[14px] rounded-[8px] transition-opacity disabled:opacity-60"
            style={{
              background: '#C2401E',
              color: '#fff',
              padding: '12px',
              fontFamily: 'inherit',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-[13px] text-center mt-5" style={{ color: '#6B5C53' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="hover:underline" style={{ color: '#C2401E' }}>
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
