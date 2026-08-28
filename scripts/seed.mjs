/**
 * Seeds Atlas with the initial catalogue and demo orders.
 *
 *   npm run seed
 *
 * Idempotent: products are upserted by `id`, so re-running refreshes the
 * catalogue without duplicating. Orders are only inserted when the collection
 * is empty, so your own test orders are never clobbered.
 */
import { config } from 'dotenv'
import { MongoClient } from 'mongodb'

config({ path: '.env.local' })

const uri = process.env.MONGODB_URI
if (!uri || uri.includes('PASTE_NEW_PASSWORD_HERE')) {
  console.error('\n  MONGODB_URI is missing or still has the placeholder password.')
  console.error('  Edit .env.local, then run `npm run seed` again.\n')
  process.exit(1)
}

const { products, SIZES } = await import('../lib/products.ts')

const seedInventory = (sizes, seed) =>
  Object.fromEntries(sizes.map((size, i) => [size, ((seed * 7 + i * 13) % 22) + 2]))

const orders = [
  {
    id: 'SF-2431',
    placedAt: '2026-08-27T14:12:00.000Z',
    customer: { name: 'Ana Ferreira', email: 'ana.f@example.com' },
    status: 'pending',
    lines: [
      { productId: 'heavyweight', size: 'M', qty: 1, unitPrice: 68 },
      { productId: 'pima', size: 'S', qty: 2, unitPrice: 58 },
    ],
  },
  {
    id: 'SF-2430',
    placedAt: '2026-08-27T09:48:00.000Z',
    customer: { name: 'Tomás Silva', email: 't.silva@example.com' },
    status: 'fulfilled',
    lines: [{ productId: 'studio', size: 'L', qty: 1, unitPrice: 62 }],
  },
  {
    id: 'SF-2429',
    placedAt: '2026-08-26T18:05:00.000Z',
    customer: { name: 'Iris Lindqvist', email: 'iris.l@example.com' },
    status: 'fulfilled',
    lines: [
      { productId: 'everyday', size: 'XS', qty: 1, unitPrice: 54 },
      { productId: 'essential', size: 'XL', qty: 1, unitPrice: 52 },
      { productId: 'ribbed', size: 'M', qty: 1, unitPrice: 56 },
    ],
  },
  {
    id: 'SF-2428',
    placedAt: '2026-08-26T11:30:00.000Z',
    customer: { name: 'Marco Bianchi', email: 'm.bianchi@example.com' },
    status: 'cancelled',
    lines: [{ productId: 'heavyweight', size: 'XXL', qty: 1, unitPrice: 68 }],
  },
  {
    id: 'SF-2427',
    placedAt: '2026-08-25T16:22:00.000Z',
    customer: { name: 'Yuki Tanaka', email: 'y.tanaka@example.com' },
    status: 'pending',
    lines: [{ productId: 'pima', size: 'L', qty: 3, unitPrice: 58 }],
  },
]

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 })

try {
  await client.connect()
  const db = client.db()
  console.log(`\n  connected to "${db.databaseName}"`)

  // Products — upsert by id.
  const col = db.collection('products')
  for (const [i, product] of products.entries()) {
    await col.updateOne(
      { id: product.id },
      {
        $set: {
          ...product,
          status: i === 2 ? 'draft' : 'active',
          updatedAt: new Date().toISOString(),
        },
        // Only seeded on first insert, so real stock levels are never reset.
        $setOnInsert: { inventory: seedInventory(product.sizes, i + 1) },
      },
      { upsert: true },
    )
  }
  await col.createIndex({ id: 1 }, { unique: true })
  await col.createIndex({ status: 1 })
  console.log(`  products : ${await col.countDocuments()} (indexed on id, status)`)

  // Orders — only if empty.
  const ordersCol = db.collection('orders')
  if ((await ordersCol.countDocuments()) === 0) {
    await ordersCol.insertMany(orders)
    console.log(`  orders   : ${orders.length} inserted`)
  } else {
    console.log(`  orders   : ${await ordersCol.countDocuments()} already present, left alone`)
  }
  await ordersCol.createIndex({ id: 1 }, { unique: true })
  await ordersCol.createIndex({ placedAt: -1 })
  await ordersCol.createIndex({ status: 1 })

  console.log('\n  done. run `npm run dev` and open /admin\n')
} catch (err) {
  console.error('\n  seed failed:', err instanceof Error ? err.message : err)
  console.error('\n  common causes:')
  console.error('   - password not replaced in .env.local')
  console.error('   - your IP is not allowlisted (Atlas → Network Access)')
  console.error('   - password contains characters needing URL-encoding\n')
  process.exitCode = 1
} finally {
  await client.close()
}
