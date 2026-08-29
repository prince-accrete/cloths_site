import { MongoClient, type Db } from 'mongodb'

/**
 * Shared MongoDB connection.
 *
 * The client is cached on `globalThis` in development because Next's
 * hot-reload re-evaluates modules on every save. Without the cache each edit
 * opens a new pool and quickly exhausts Atlas's connection limit — the most
 * common way a Next + Mongo project falls over locally.
 *
 * Import only from server components, route handlers and 'use server' actions.
 */

const options = {
  // Fail fast with a clear message instead of hanging for 30s when the IP is
  // not allowlisted or the cluster is asleep.
  serverSelectionTimeoutMS: 8000,
  maxPoolSize: 10,
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined
}

function client(): MongoClient {
  if (globalThis._mongoClient) return globalThis._mongoClient

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Copy .env.example to .env.local, fill in your Atlas ' +
        'connection string, and restart the dev server — env files are read at startup.',
    )
  }
  if (uri.includes('PASTE_NEW_PASSWORD_HERE')) {
    throw new Error(
      'MONGODB_URI still has the placeholder password. Rotate the password in Atlas ' +
        '(Database Access → Edit → Autogenerate), then paste it into .env.local.',
    )
  }

  const c = new MongoClient(uri, options)
  if (process.env.NODE_ENV === 'development') globalThis._mongoClient = c
  return c
}

/**
 * Synchronous handle. The driver connects lazily on first operation and buffers
 * until then, so a Db reference is available without awaiting. Better Auth's
 * adapter needs one at config time, where top-level await is not available.
 */
export function getDbSync(): Db {
  return client().db()
}

export async function getDb(): Promise<Db> {
  const c = client()
  await c.connect() // idempotent in the modern driver
  return c.db()
}
