import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/site/auth-form'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const [{ from }, session] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: await headers() }),
  ])

  if (session) redirect('/account')

  // Only accept same-site paths — an open redirect would let a phishing link
  // bounce users off this page to anywhere.
  const target = from?.startsWith('/') && !from.startsWith('//') ? from : '/account'

  return (
    <div className="shell auth-page">
      <AuthForm redirectTo={target} />
    </div>
  )
}
