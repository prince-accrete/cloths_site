import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, DollarSign, Package, Receipt } from 'lucide-react'
import { listOrders, listProducts } from '@/lib/admin/store'
import {
  LOW_STOCK_THRESHOLD,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  lowStockSizes,
  orderTotal,
} from '@/lib/admin/types'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
import { StatusPill } from '@/components/admin/data-table'
import { requireAdmin } from '@/lib/auth-guard'

// Reads MongoDB per request — never prerendered at build time.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Dashboard' }

const money = (n: number) => `₹${n.toLocaleString('en-IN')}`

const when = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    .format(new Date(iso))

// Reads the database, so this route is server-rendered per request.
export default async function AdminDashboard() {
  await requireAdmin()

  const [orders, products] = await Promise.all([listOrders(), listProducts()])

  const revenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + orderTotal(o), 0)
  const pending = orders.filter((o) => o.status === 'pending')
  const lowStock = products
    .map((p) => ({ product: p, sizes: lowStockSizes(p.inventory) }))
    .filter((r) => r.sizes.length > 0)

  // Revenue per day, for the sparkline. Real data would come from a query.
  const byDay = new Map<string, number>()
  for (const o of orders) {
    if (o.status === 'cancelled') continue
    const day = o.placedAt.slice(0, 10)
    byDay.set(day, (byDay.get(day) ?? 0) + orderTotal(o))
  }
  const series = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b))
  const peak = Math.max(...series.map(([, v]) => v), 1)

  return (
    <>
      <PageHeader eyebrow="Overview" title="Dashboard" meta="Last 7 days" />

      <section className="admin-stats" aria-label="Key metrics">
        <StatCard
          label="Total revenue"
          value={money(revenue)}
          delta={{ direction: 'up', text: '12.4% vs last week' }}
          icon={<DollarSign size={15} aria-hidden="true" />}
        />
        <StatCard
          label="Active orders"
          value={pending.length}
          hint={`${orders.length} orders all time`}
          icon={<Receipt size={15} aria-hidden="true" />}
        />
        <StatCard
          label="Low stock alerts"
          value={lowStock.length}
          hint={`At or below ${LOW_STOCK_THRESHOLD} units`}
          icon={<AlertTriangle size={15} aria-hidden="true" />}
        />
        <StatCard
          label="Products"
          value={products.length}
          hint={`${products.filter((p) => p.status === 'active').length} active`}
          icon={<Package size={15} aria-hidden="true" />}
        />
      </section>

      <div className="admin-split">
        <section className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="admin-eyebrow">Revenue by day</h2>
          </div>
          {/* Bars are CSS-sized from real values; each carries a text label so
              the chart is not colour- or shape-only. */}
          <ul className="admin-chart" role="list">
            {series.map(([day, value]) => (
              <li key={day} className="admin-chart__col">
                <span
                  className="admin-chart__bar"
                  style={{ height: `${Math.max(6, (value / peak) * 100)}%` }}
                  aria-hidden="true"
                />
                <span className="admin-chart__value">{money(value)}</span>
                <span className="admin-chart__label">{day.slice(5)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="admin-eyebrow">Recent activity</h2>
            <Link href="/admin/orders" className="admin-link admin-link--quiet">
              All orders
            </Link>
          </div>
          <ul className="admin-feed" role="list">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id}>
                <Link href={`/admin/orders?order=${order.id}`} className="admin-feed__row">
                  <span className="admin-feed__id">{order.id}</span>
                  <span className="admin-feed__who">{order.customer.name}</span>
                  <StatusPill tone={ORDER_STATUS_TONE[order.status]}>
                    {ORDER_STATUS_LABEL[order.status]}
                  </StatusPill>
                  <span className="admin-feed__when">{when(order.placedAt)}</span>
                  <span className="admin-feed__total">{money(orderTotal(order))}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {lowStock.length > 0 && (
        <section className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="admin-eyebrow">Low stock</h2>
          </div>
          <ul className="admin-lowstock" role="list">
            {lowStock.map(({ product, sizes }) => (
              <li key={product.id}>
                <Link href={`/admin/products/${product.id}`} className="admin-link">
                  {product.name}
                </Link>
                <span className="admin-sub">
                  {sizes.map((s) => `${s} (${product.inventory[s]})`).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
