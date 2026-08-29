import { SIZES } from '@/lib/products'
import { getDb } from '@/lib/mongodb'
import type { AdminProduct, Address, Inventory, Order, OrderLine, PaymentMethod, ProductStatus } from './types'

/**
 * Data access for the admin panel.
 *
 * Backed by MongoDB Atlas. This is the only module that talks to the database —
 * every route and action goes through the functions below, which is what made
 * replacing the previous in-memory store a single-file change.
 *
 * Server-only: every caller is a server component or a 'use server' action, so
 * this never reaches the client bundle.
 */

const PRODUCTS = 'products'
const ORDERS = 'orders'

/** Mongo adds `_id`; every query projects it away so documents match our types. */
type Doc<T> = T & { _id?: unknown }

function strip<T>(doc: Doc<T> | null): T | undefined {
  if (!doc) return undefined
  const { _id, ...rest } = doc
  return rest as T
}

/* ------------------------------------------------------------- products -- */

export async function listProducts(): Promise<AdminProduct[]> {
  const db = await getDb()
  const docs = await db
    .collection<Doc<AdminProduct>>(PRODUCTS)
    .find({}, { projection: { _id: 0 } })
    .sort({ name: 1 })
    .toArray()
  return docs as AdminProduct[]
}

/** Only what customers should see — for the storefront. */
export async function listActiveProducts(): Promise<AdminProduct[]> {
  const db = await getDb()
  const docs = await db
    .collection<Doc<AdminProduct>>(PRODUCTS)
    .find({ status: 'active' }, { projection: { _id: 0 } })
    .toArray()
  return docs as AdminProduct[]
}

/** A single product, only if customers should see it. */
export async function getActiveProduct(id: string): Promise<AdminProduct | undefined> {
  const db = await getDb()
  const doc = await db
    .collection<Doc<AdminProduct>>(PRODUCTS)
    .findOne({ id, status: 'active' }, { projection: { _id: 0 } })
  return strip(doc)
}

export async function getAdminProduct(id: string): Promise<AdminProduct | undefined> {
  const db = await getDb()
  const doc = await db
    .collection<Doc<AdminProduct>>(PRODUCTS)
    .findOne({ id }, { projection: { _id: 0 } })
  return strip(doc)
}

export type ProductPatch = {
  name: string
  price: number
  fit: AdminProduct['fit']
  color: string
  fabric: string
  tagline: string
  description: string
  status: ProductStatus
  inventory: Inventory
}

/**
 * Creates a product.
 *
 * The id is a slug derived from the name, which is what the storefront URL
 * uses. A unique index on `id` means a duplicate throws rather than silently
 * overwriting an existing product.
 */
export async function createProduct(patch: ProductPatch & { images: { src: string; alt: string }[] }) {
  const db = await getDb()
  const id = patch.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)

  if (!id) return { ok: false as const, reason: 'That name has no usable characters.' }
  if (await db.collection(PRODUCTS).findOne({ id })) {
    return { ok: false as const, reason: `A product with the id "${id}" already exists.` }
  }

  const doc: AdminProduct = {
    id,
    name: patch.name,
    price: patch.price,
    fit: patch.fit,
    color: patch.color,
    swatch: '#d8d3c8',
    fabric: patch.fabric,
    tagline: patch.tagline,
    description: patch.description,
    details: [],
    images: patch.images,
    sizes: SIZES.filter((s) => patch.inventory[s] !== undefined),
    inventory: patch.inventory,
    status: patch.status,
    updatedAt: new Date().toISOString(),
  }
  await db.collection<Doc<AdminProduct>>(PRODUCTS).insertOne(doc)
  return { ok: true as const, product: doc }
}

export async function updateProduct(id: string, patch: ProductPatch) {
  const db = await getDb()
  const doc = await db.collection<Doc<AdminProduct>>(PRODUCTS).findOneAndUpdate(
    { id },
    {
      $set: {
        ...patch,
        // `sizes` is derived from inventory: a size is carried if it has a row.
        sizes: SIZES.filter((s) => patch.inventory[s] !== undefined),
        updatedAt: new Date().toISOString(),
      },
    },
    { returnDocument: 'after', projection: { _id: 0 } },
  )
  return strip(doc as Doc<AdminProduct> | null)
}

/* --------------------------------------------------------------- orders -- */

export async function listOrders(): Promise<Order[]> {
  const db = await getDb()
  const docs = await db
    .collection<Doc<Order>>(ORDERS)
    .find({}, { projection: { _id: 0 } })
    .sort({ placedAt: -1 })
    .toArray()
  return docs as Order[]
}

export async function setOrderStatus(id: string, status: Order['status']) {
  const db = await getDb()
  const doc = await db
    .collection<Doc<Order>>(ORDERS)
    .findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: 'after', projection: { _id: 0 } },
    )
  return strip(doc as Doc<Order> | null)
}

/**
 * Places an order and decrements stock in one pass.
 *
 * Inventory is checked and decremented with a conditional update per line —
 * `$gte` in the filter means a line only succeeds if that size still has
 * enough stock. Two people buying the last shirt at the same moment cannot
 * both win, because Mongo applies the updates one at a time.
 *
 * Note this is not a transaction: if line 3 of 4 fails, lines 1-2 are already
 * decremented and get rolled back manually below. A replica-set transaction
 * would be the stronger fix, and is worth doing before real traffic.
 */
export async function placeOrder(input: {
  lines: OrderLine[]
  customer: { name: string; email: string }
  address: Address
  payment: PaymentMethod
  userId?: string
}): Promise<{ ok: true; order: Order } | { ok: false; reason: string }> {
  const db = await getDb()
  const products = db.collection<Doc<AdminProduct>>(PRODUCTS)

  if (input.lines.length === 0) return { ok: false, reason: 'Your bag is empty.' }

  const taken: OrderLine[] = []
  const priced: OrderLine[] = []

  for (const line of input.lines) {
    const res = await products.findOneAndUpdate(
      { id: line.productId, status: 'active', [`inventory.${line.size}`]: { $gte: line.qty } },
      { $inc: { [`inventory.${line.size}`]: -line.qty } },
      { returnDocument: 'after', projection: { _id: 0, price: 1, name: 1 } },
    )
    if (res) {
      taken.push(line)
      // Price comes from the database, never from the request. A client can
      // post any unitPrice it likes; this is what stops it mattering.
      priced.push({ ...line, unitPrice: (res as { price: number }).price })
      continue
    }
    // Put back whatever this attempt already took.
    for (const t of taken) {
      await products.updateOne({ id: t.productId }, { $inc: { [`inventory.${t.size}`]: t.qty } })
    }
    const p = await products.findOne({ id: line.productId }, { projection: { name: 1, _id: 0 } })
    return { ok: false, reason: `${p?.name ?? line.productId} (${line.size}) is out of stock.` }
  }

  // SF-2431 style, continuing from the seeded demo range.
  const count = await db.collection(ORDERS).countDocuments()
  const order: Order = {
    id: `SF-${2432 + count}`,
    placedAt: new Date().toISOString(),
    customer: input.customer,
    userId: input.userId,
    address: input.address,
    payment: { method: input.payment, status: 'pending' },
    status: 'pending',
    lines: priced,
  }
  await db.collection<Doc<Order>>(ORDERS).insertOne(order)
  return { ok: true, order }
}

/** A signed-in customer's own orders. */
export async function listOrdersForUser(userId: string): Promise<Order[]> {
  const db = await getDb()
  const docs = await db
    .collection<Doc<Order>>(ORDERS)
    .find({ userId }, { projection: { _id: 0 } })
    .sort({ placedAt: -1 })
    .toArray()
  return docs as Order[]
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const db = await getDb()
  return strip(await db.collection<Doc<Order>>(ORDERS).findOne({ id }, { projection: { _id: 0 } }))
}

/* ---------------------------------------------------------- newsletter -- */

export async function subscribe(email: string) {
  const db = await getDb()
  await db
    .collection('subscribers')
    .updateOne(
      { email },
      { $setOnInsert: { email, subscribedAt: new Date().toISOString() } },
      { upsert: true },
    )
}

/* ------------------------------------------------------------ customers -- */

export type CustomerRow = { name: string; email: string; orders: number; spent: number }

/**
 * Aggregated in the database rather than in Node. Pulling every order over the
 * wire to reduce it in JavaScript is what makes an admin dashboard slow once
 * there is real volume.
 */
export async function listCustomers(): Promise<CustomerRow[]> {
  const db = await getDb()
  return db
    .collection<Order>(ORDERS)
    .aggregate<CustomerRow>([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$lines' },
      {
        $group: {
          _id: '$customer.email',
          name: { $first: '$customer.name' },
          orderIds: { $addToSet: '$id' },
          spent: { $sum: { $multiply: ['$lines.unitPrice', '$lines.qty'] } },
        },
      },
      {
        $project: {
          _id: 0,
          email: '$_id',
          name: 1,
          spent: 1,
          orders: { $size: '$orderIds' },
        },
      },
      { $sort: { spent: -1 } },
    ])
    .toArray()
}
