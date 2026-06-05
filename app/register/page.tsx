'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseAuth } from '@/lib/supabase-browser'

function validate(name: string, email: string, password: string): string | null {
  if (name.trim().length < 2) return 'Name must be at least 2 characters.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  return null
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const validationError = validate(name, email, password)
    if (validationError) { setError(validationError); return }

    setLoading(true)
    const { error: signUpError } = await supabaseAuth.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    })
    setLoading(false)

    if (signUpError) { setError(signUpError.message); return }

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
          Create your account
        </h1>
        <p style={{ fontSize: '14px', color: '#6B5C53', marginBottom: '28px' }}>
          Start tracking Vienna dorms in seconds
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Name" htmlFor="reg-name">
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
              aria-describedby={error ? 'reg-error' : undefined}
              className="w-full border border-[#E5E5E5] rounded-[8px] p-3 text-[14px] outline-none focus:border-[#FF6B47] transition-colors"
              style={{ fontFamily: 'inherit' }}
            />
          </Field>

          <Field label="Email" htmlFor="reg-email">
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full border border-[#E5E5E5] rounded-[8px] p-3 text-[14px] outline-none focus:border-[#FF6B47] transition-colors"
              style={{ fontFamily: 'inherit' }}
            />
          </Field>

          <Field label="Password" htmlFor="reg-password" last>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="8+ characters"
              autoComplete="new-password"
              required
              className="w-full border border-[#E5E5E5] rounded-[8px] p-3 text-[14px] outline-none focus:border-[#FF6B47] transition-colors"
              style={{ fontFamily: 'inherit' }}
            />
          </Field>

          {error && (
            <p id="reg-error" role="alert" className="text-[13px] mb-4" style={{ color: '#C2401E' }}>
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
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-[13px] text-center mt-5" style={{ color: '#6B5C53' }}>
          Already have an account?{' '}
          <Link href="/login" className="hover:underline" style={{ color: '#C2401E' }}>
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}

function Field({
  label,
  htmlFor,
  last = false,
  children,
}: {
  label: string
  htmlFor: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: last ? '20px' : '16px' }}>
      <label
        htmlFor={htmlFor}
        className="block font-medium text-[13px] mb-1.5"
        style={{ color: '#1A1410' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}
