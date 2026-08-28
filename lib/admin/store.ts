import { SIZES } from '@/lib/products'
import { getDb } from '@/lib/mongodb'
import type { AdminProduct, Inventory, Order, ProductStatus } from './types'

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
