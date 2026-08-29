'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { authClient, signIn } from '@/lib/auth-client'

/**
 * Customer sign in / create account.
 *
 * Email and password, no OTP — phone verification needs DLT registration in
 * India, which is paperwork rather than code. The auth library supports phone
 * OTP as a plugin, so adding it later is an addition, not a rewrite.
 */
export function AuthForm({ redirectTo = '/account' }: { redirectTo?: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const isSignUp = mode === 'signup'

  async function onSubmit(formData: FormData) {
    setPending(true)
    setError('')

    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    const result = isSignUp
      ? await authClient.signUp.email({
          email,
          password,
          name: String(formData.get('name') ?? '') || email.split('@')[0],
        })
      : await signIn.email({ email, password })

    if (result.error) {
      setError(
        isSignUp
          ? (result.error.message ?? 'Could not create that account.')
          : // Deliberately vague — saying which half was wrong tells an
            // attacker which emails are registered.
            'Those details did not work.',
      )
      setPending(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form action={onSubmit} className="auth">
      <span className="eyebrow">{isSignUp ? 'Create account' : 'Welcome back'}</span>
      <h1 className="display display--sm">{isSignUp ? 'Join Still Fits.' : 'Sign in.'}</h1>

      {isSignUp && (
        <div className="co-field">
          <label className="eyebrow" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" autoComplete="name" />
        </div>
      )}

      <div className="co-field">
        <label className="eyebrow" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" autoFocus />
      </div>

      <div className="co-field">
        <label className="eyebrow" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={12}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
        />
        {isSignUp && <p className="meta">At least 12 characters.</p>}
      </div>

      {error && (
        <p className="co-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="button button--dark button--block" disabled={pending}>
        {pending ? <Loader2 size={15} className="admin-spin" aria-hidden="true" /> : null}
        {pending ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
        {!pending && <ArrowRight size={15} />}
      </button>

      <button
        type="button"
        className="text-link"
        onClick={() => {
          setMode(isSignUp ? 'signin' : 'signup')
          setError('')
        }}
      >
        {isSignUp ? 'I already have an account' : 'Create an account instead'}
      </button>

      <p className="meta">
        You don’t need an account to order —{' '}
        <Link href="/checkout" className="admin-link">
          check out as a guest
        </Link>
        .
      </p>
    </form>
  )
}
