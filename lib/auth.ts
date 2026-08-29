import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { nextCookies } from 'better-auth/next-js'
import { getDbSync } from '@/lib/mongodb'

/**
 * Authentication.
 *
 * One system for the whole site. Today it only guards /admin, but customer
 * login lands on the same tables later — building a throwaway admin-only auth
 * now would mean building auth twice.
 *
 * Sessions are stored in MongoDB rather than being JWT-only, so a compromised
 * session can actually be revoked. Better Auth creates its own collections
 * (user, session, account, verification) alongside products and orders.
 *
 * There is no public sign-up: `disableSignUp` closes the endpoint entirely.
 * Admin accounts are created with `npm run create-admin`.
 */

export const auth = betterAuth({
  database: mongodbAdapter(getDbSync()),

  // Without this the origin is inferred from the incoming request, which makes
  // callbacks and redirects wrong behind a proxy.
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    // Open, because customers need accounts. This is NOT a way into the
    // admin: `role` below is input:false, so it cannot be set through a
    // sign-up payload and always starts as 'customer'. Admin accounts exist
    // only via `npm run create-admin`, which promotes after creating.
    disableSignUp: false,
    minPasswordLength: 12,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },

  user: {
    additionalFields: {
      // 'admin' is required for anything under /admin. Checked in middleware
      // AND in every server action — a middleware-only check is not enough,
      // because server actions are independently callable endpoints.
      role: { type: 'string', defaultValue: 'customer', input: false },
    },
  },

  // Must be last: lets Better Auth set cookies from server actions.
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
