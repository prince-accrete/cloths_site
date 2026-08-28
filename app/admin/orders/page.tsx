import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { listOrders, listProducts } from '@/lib/admin/store'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, orderTotal, type Order } from '@/lib/admin/types'
import { DataTable, StatusPill, type Column } from '@/components/admin/data-table'
import { PageHeader } from '@/components/admin/page-header'
import { OrderDrawer } from '@/components/admin/order-drawer'

// Reads MongoDB per request — never prerendered at build time.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Orders' }

const date = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )

const columns: Column<Order>[] = [
  {
    key: 'id',
    header: 'Order ID',
    width: '116px',
    cell: (o) => (
      // Opening the drawer is a URL change, so the row target is a real link:
      // middle-click, copy-link and back all behave correctly.
      <Link href={`/admin/orders?order=${o.id}`} className="admin-link" scroll={false}>
        {o.id}
      </Link>
    ),
  },
  { key: 'date', header: 'Date', width: '128px', secondary: true, cell: (o) => date(o.placedAt) },
  {
    key: 'customer',
    header: 'Customer',
    cell: (o) => (
      <>
        {o.customer.name}
        <span className="admin-sub">{o.customer.email}</span>
      </>
    ),
  },
  {
    key: 'items',
    header: 'Items',
    align: 'end',
    numeric: true,
    secondary: true,
    width: '72px',
    cell: (o) => o.lines.reduce((n, l) => n + l.qty, 0),
  },
  {
    key: 'total',
    header: 'Total',
    align: 'end',
    numeric: true,
    width: '92px',
    cell: (o) => `$${orderTotal(o)}`,
  },
  {
    key: 'status',
    header: 'Status',
    align: 'end',
    width: '112px',
    cell: (o) => (
      <StatusPill tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</StatusPill>
    ),
  },
]

export default async function AdminOrdersPage() {
  const orders = await listOrders()
  const pending = orders.filter((o) => o.status === 'pending').length

  // Flat lookup so the client drawer never needs the full catalogue.
  const productLookup = Object.fromEntries(
    (await listProducts()).map((p) => [
      p.id,
      { name: p.name, image: p.images[0].src, href: `/admin/products/${p.id}` },
    ]),
  )

  return (
    <>
      <PageHeader
        eyebrow="Fulfilment"
        title="Orders"
        meta={`${orders.length} orders · ${pending} awaiting fulfilment`}
      />

      <section className="admin-panel">
        <DataTable
          caption="All orders, with customer, total and fulfilment status"
          columns={columns}
          rows={orders}
          getRowKey={(o) => o.id}
          empty="No orders yet."
        />
      </section>

      {/* useSearchParams needs a Suspense boundary during prerender. */}
      <Suspense fallback={null}>
        <OrderDrawer orders={orders} productLookup={productLookup} />
      </Suspense>
    </>
  )
}
