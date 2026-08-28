import type { Product, Size } from '@/lib/products'

export type ProductStatus = 'draft' | 'active'

/** Stock on hand per size. A size absent from the map is not carried at all. */
export type Inventory = Partial<Record<Size, number>>

export type AdminProduct = Product & {
  status: ProductStatus
  inventory: Inventory
  updatedAt: string
}

export type OrderStatus = 'pending' | 'fulfilled' | 'cancelled'

/** Line items reference productId + size, matching the storefront cart line. */
export type OrderLine = {
  productId: string
  size: Size
  qty: number
  /** Unit price at time of purchase — never re-read from the catalogue. */
  unitPrice: number
}

export type Order = {
  id: string
  placedAt: string
  customer: { name: string; email: string }
  status: OrderStatus
  lines: OrderLine[]
}

/** Traffic-light tone per status — one mapping, used by every view. */
export const ORDER_STATUS_TONE: Record<OrderStatus, 'positive' | 'warning' | 'danger'> = {
  pending: 'warning',
  fulfilled: 'positive',
  cancelled: 'danger',
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
}

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  draft: 'Draft',
  active: 'Active',
}

/** Below this, a size shows a low-stock warning on the dashboard. */
export const LOW_STOCK_THRESHOLD = 6

export function orderTotal(order: Order) {
  return order.lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0)
}

export function totalStock(inventory: Inventory) {
  return Object.values(inventory).reduce<number>((sum, n) => sum + (n ?? 0), 0)
}

export function lowStockSizes(inventory: Inventory) {
  return (Object.entries(inventory) as [Size, number][])
    .filter(([, n]) => n <= LOW_STOCK_THRESHOLD)
    .map(([size]) => size)
}
