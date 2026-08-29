/**
 * Creates an admin user.
 *
 *   npm run create-admin -- you@example.com "Your Name"
 *
 * Goes through Better Auth's own signUpEmail API rather than writing `user`
 * and `account` documents by hand. Hand-written records have to match the
 * adapter's internal schema exactly — including that it maps `id` onto Mongo's
 * `_id` — and getting that subtly wrong produces a "User not found" 401 with
 * no other symptom. Letting the library own its schema removes the whole class
 * of bug.
 *
 * Public sign-up is disabled in lib/auth.ts, so ALLOW_SIGNUP is set for the
 * lifetime of this process only, then the user is promoted to admin.
 */
import { config } from 'dotenv'
import { randomBytes } from 'node:crypto'

config({ path: '.env.local', quiet: true })
process.env.ALLOW_SIGNUP = 'true'

const [email, name = 'Admin'] = process.argv.slice(2)

if (!email || !email.includes('@')) {
  console.error('\n  usage: npm run create-admin -- you@example.com "Your Name"\n')
  process.exit(1)
}

const { auth } = await import('@/lib/auth')
const { getDb } = await import('@/lib/mongodb')

const password = randomBytes(18).toString('base64url')

try {
  await auth.api.signUpEmail({ body: { email, password, name } })

  // `role` is input:false in the auth config precisely so it can never be set
  // through a sign-up payload — it is promoted here instead.
  const db = await getDb()
  const res = await db.collection('user').updateOne({ email }, { $set: { role: 'admin' } })
  if (res.matchedCount === 0) throw new Error('user was created but could not be promoted')

  console.log('\n  admin created')
  console.log('  email    :', email)
  console.log('  password :', password)
  console.log('\n  Save it now — only the hash is stored, it cannot be shown again.')
  console.log('  Sign in at /admin/login\n')
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  console.error('\n  failed:', msg)
  if (/exist/i.test(msg)) console.error('  That email already has an account.\n')
  process.exitCode = 1
}

process.exit()
