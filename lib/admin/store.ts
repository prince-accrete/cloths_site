import { products, SIZES, type Size } from '@/lib/products'
import type { AdminProduct, Inventory, Order, ProductStatus } from './types'

/**
 * In-memory admin store. Server-side only — every consumer is a server
 * component or a 'use server' action, so this module never reaches the client
 * bundle. (`server-only` would enforce that at build time; it is not a
 * dependency here, so the boundary is by convention.)
 *
 * There is no database behind this project, so the catalogue seeds from
 * `lib/products.ts` and mutations live in module scope. That means edits
 * survive navigation within a running server but are lost on restart, and are
 * NOT shared across serverless instances. Swapping this file for real queries
 * is the only change the admin routes need — every consumer goes through the
 * functions below rather than touching the arrays.
 */

const seedInventory = (sizes: Size[], seed: number): Inventory =>
  Object.fromEntries(
    sizes.map((size, i) => [size, ((seed * 7 + i * 13) % 22) + 2]),
  ) as Inventory

const catalogue = new Map<string, AdminProduct>(
  products.map((product, i) => [
    product.id,
    {
      ...product,
      status: i === 2 ? 'draft' : 'active',
      inventory: seedInventory(product.sizes, i + 1),
      updatedAt: '2026-08-20T10:00:00.000Z',
    },
  ]),
)

/* ------------------------------------------------------------- products -- */

export function listProducts(): AdminProduct[] {
  return [...catalogue.values()]
}

export function getAdminProduct(id: string): AdminProduct | undefined {
  return catalogue.get(id)
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

export function updateProduct(id: string, patch: ProductPatch) {
  const existing = catalogue.get(id)
  if (!existing) return undefined
  const next: AdminProduct = {
    ...existing,
    ...patch,
    // `sizes` is derived from inventory: a size is carried if it has a row.
    sizes: SIZES.filter((s) => patch.inventory[s] !== undefined),
    updatedAt: new Date().toISOString(),
  }
  catalogue.set(id, next)
  return next
}

/* --------------------------------------------------------------- orders -- */

const orders: Order[] = [
  {
    id: 'PP-2431',
    placedAt: '2026-08-27T14:12:00.000Z',
    customer: { name: 'Ana Ferreira', email: 'ana.f@example.com' },
    status: 'pending',
    lines: [
      { productId: 'heavyweight', size: 'M', qty: 1, unitPrice: 68 },
      { productId: 'pima', size: 'S', qty: 2, unitPrice: 58 },
    ],
  },
  {
    id: 'PP-2430',
    placedAt: '2026-08-27T09:48:00.000Z',
    customer: { name: 'Tomás Silva', email: 't.silva@example.com' },
    status: 'fulfilled',
    lines: [{ productId: 'studio', size: 'L', qty: 1, unitPrice: 62 }],
  },
  {
    id: 'PP-2429',
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
    id: 'PP-2428',
    placedAt: '2026-08-26T11:30:00.000Z',
    customer: { name: 'Marco Bianchi', email: 'm.bianchi@example.com' },
    status: 'cancelled',
    lines: [{ productId: 'heavyweight', size: 'XXL', qty: 1, unitPrice: 68 }],
  },
  {
    id: 'PP-2427',
    placedAt: '2026-08-25T16:22:00.000Z',
    customer: { name: 'Yuki Tanaka', email: 'y.tanaka@example.com' },
    status: 'pending',
    lines: [{ productId: 'pima', size: 'L', qty: 3, unitPrice: 58 }],
  },
]

export function listOrders(): Order[] {
  return orders
}

export function setOrderStatus(id: string, status: Order['status']) {
  const order = orders.find((o) => o.id === id)
  if (order) order.status = status
  return order
}

/* ------------------------------------------------------------ customers -- */

export function listCustomers() {
  const byEmail = new Map<string, { name: string; email: string; orders: number; spent: number }>()
  for (const order of orders) {
    if (order.status === 'cancelled') continue
    const row = byEmail.get(order.customer.email) ?? {
      ...order.customer,
      orders: 0,
      spent: 0,
    }
    row.orders += 1
    row.spent += order.lines.reduce((s, l) => s + l.unitPrice * l.qty, 0)
    byEmail.set(order.customer.email, row)
  }
  return [...byEmail.values()].sort((a, b) => b.spent - a.spent)
}
