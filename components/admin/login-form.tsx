'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, LogIn } from 'lucide-react'
import { signIn } from '@/lib/auth-client'

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(formData: FormData) {
    setPending(true)
    setError('')

    const { error } = await signIn.email({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    })

    if (error) {
      // Deliberately vague: distinguishing "no such user" from "wrong password"
      // tells an attacker which emails are registered.
      setError('Those credentials did not work.')
      setPending(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form action={onSubmit} className="admin-auth__card">
      <span className="admin-mark__full">STILL FITS<sup>®</sup></span>
      <h1 className="admin-title">Sign in</h1>
      <p className="admin-sub">Store administration</p>

      <div className="admin-field">
        <label className="admin-eyebrow" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" autoFocus />
      </div>

      <div className="admin-field">
        <label className="admin-eyebrow" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="admin-field__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="admin-button admin-button--primary" disabled={pending}>
        {pending ? <Loader2 size={14} className="admin-spin" aria-hidden="true" /> : <LogIn size={14} aria-hidden="true" />}
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
