import { NextResponse, type NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

/**
 * First gate on /admin.
 *
 * This is an optimistic check only — it reads the session cookie without
 * hitting the database, because middleware runs on every matched request and a
 * DB round-trip here would tax the whole route group.
 *
 * It is NOT the security boundary. A cookie can be forged; the real check is
 * requireAdmin() in lib/auth-guard.ts, which validates the session against the
 * database and is called by every admin page and every server action. This
 * just saves an unauthenticated visitor from rendering a page they cannot use.
 */
export function middleware(request: NextRequest) {
  // The login page lives under /admin but must stay reachable, or it
  // redirects to itself forever.
  if (request.nextUrl.pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  const cookie = getSessionCookie(request)

  if (!cookie) {
    const url = new URL('/admin/login', request.url)
    // Send them back where they were trying to go after signing in.
    url.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Everything under /admin except the login page itself.
  matcher: ['/admin/:path*'],
}
