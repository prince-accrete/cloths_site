import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth'

/**
 * Better Auth's endpoints (sign-in, sign-out, session, …).
 *
 * The one place in this project that needs a real HTTP route handler rather
 * than a server action, because the auth client calls it over fetch.
 */
export const { GET, POST } = toNextJsHandler(auth)
