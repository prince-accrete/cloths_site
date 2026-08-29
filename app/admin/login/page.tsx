import type { Metadata } from 'next'
import { LoginForm } from '@/components/admin/login-form'

export const metadata: Metadata = { title: 'Sign in' }

/**
 * Sits inside /admin but outside the admin shell — it has its own minimal
 * layout, because showing the sidebar to someone who is not signed in would be
 * both odd and a small information leak.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const { from } = await searchParams
  return <LoginForm redirectTo={from && from.startsWith('/admin') ? from : '/admin'} />
}
