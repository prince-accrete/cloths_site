import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

/**
 * The actual security boundary.
 *
 * Middleware only checks that a session cookie exists; this validates the
 * session against the database and confirms the role.
 *
 * Call it in every admin page AND at the top of every admin server action.
 * Guarding only the layout is a well-known hole: server actions are
 * independently callable HTTP endpoints, so an attacker can invoke
 * saveProductAction directly without ever rendering the page.
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect('/admin/login')

  if ((session.user as { role?: string }).role !== 'admin') {
    // Signed in, but not an admin — a customer account should not be told
    // that /admin exists.
    redirect('/')
  }

  return session
}

/** Non-redirecting variant, for places that need to branch rather than bail. */
export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null
  if ((session.user as { role?: string }).role !== 'admin') return null
  return session
}
