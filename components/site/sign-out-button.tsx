'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth-client'

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      className="text-link"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await signOut()
        router.push('/')
        // Server components hold the session, so the tree must be re-fetched.
        router.refresh()
      }}
    >
      <LogOut size={14} aria-hidden="true" /> {pending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
