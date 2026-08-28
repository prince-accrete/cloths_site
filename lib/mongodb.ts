import { MongoClient, type Db } from 'mongodb'

/**
 * Shared MongoDB connection.
 *
 * The client is cached on `globalThis` in development because Next.js
 * hot-reload re-evaluates modules on every save. Without the cache each edit
 * would open a new pool and quickly exhaust Atlas's connection limit — the most
 * common way a Next + Mongo project falls over locally.
 *
 * Configuration is validated lazily, inside getDb(), not at module scope. A
 * module-scope throw fails `next build` while it is merely *collecting* page
 * data, which turns a missing env var into an unbuildable app. Failing at
 * connection time keeps the build green and surfaces the same message on the
 * first request.
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
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function connect(): Promise<MongoClient> {
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

  if (process.env.NODE_ENV === 'development') {
    return (globalThis._mongoClientPromise ??= new MongoClient(uri, options).connect())
  }
  return new MongoClient(uri, options).connect()
}

export async function getDb(): Promise<Db> {
  const client = await connect()
  // The database name comes from the URI path (`/purepath`).
  return client.db()
}
