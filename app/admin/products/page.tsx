import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { SIZES } from '@/lib/products'
import { listProducts } from '@/lib/admin/store'
import {
  LOW_STOCK_THRESHOLD,
  PRODUCT_STATUS_LABEL,
  totalStock,
  type AdminProduct,
} from '@/lib/admin/types'
import { DataTable, StatusPill, type Column } from '@/components/admin/data-table'
import { PageHeader } from '@/components/admin/page-header'
import { requireAdmin } from '@/lib/auth-guard'

// Reads MongoDB per request — never prerendered at build time.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Products' }

const columns: Column<AdminProduct>[] = [
  {
    key: 'image',
    header: 'Image',
    width: '76px',
    cell: (p) => (
      <span className="admin-thumb">
        <Image
          src={p.images[0].src}
          alt=""
          fill
          sizes="60px"
          // Decorative here — the adjacent name cell is the accessible label.
          aria-hidden="true"
        />
      </span>
    ),
  },
  {
    key: 'name',
    header: 'Name',
    cell: (p) => (
      <Link href={`/admin/products/${p.id}`} className="admin-link">
        {p.name}
        <span className="admin-sub">
          {p.color} · {p.fit}
        </span>
      </Link>
    ),
  },
  {
    key: 'price',
    header: 'Price',
    align: 'end',
    numeric: true,
    width: '92px',
    cell: (p) => `₹${p.price.toLocaleString('en-IN')}`,
  },
  {
    key: 'inventory',
    header: 'Inventory',
    secondary: true,
    cell: (p) => (
      <span className="admin-stock">
        {SIZES.filter((s) => p.inventory[s] !== undefined).map((size) => {
          const qty = p.inventory[size] ?? 0
          return (
            <span
              key={size}
              className="admin-stock__cell"
              data-low={qty > 0 && qty <= LOW_STOCK_THRESHOLD || undefined}
              data-out={qty === 0 || undefined}
              // Colour alone never carries the warning — the tooltip and the
              // underline / strike-through say it too.
              title={`${size}: ${qty === 0 ? 'out of stock' : `${qty} in stock${qty <= LOW_STOCK_THRESHOLD ? ' — low' : ''}`}`}
            >
              <b>{size}</b>
              <i>{qty}</i>
            </span>
          )
        })}
      </span>
    ),
  },
  {
    key: 'total',
    header: 'Units',
    align: 'end',
    numeric: true,
    secondary: true,
    width: '78px',
    cell: (p) => totalStock(p.inventory),
  },
  {
    key: 'status',
    header: 'Status',
    align: 'end',
    width: '108px',
    cell: (p) => (
      <StatusPill tone={p.status === 'active' ? 'positive' : 'muted'}>
        {PRODUCT_STATUS_LABEL[p.status]}
      </StatusPill>
    ),
  },
]

export default async function AdminProductsPage() {
  await requireAdmin()

  const rows = await listProducts()
  const active = rows.filter((p) => p.status === 'active').length

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        meta={`${rows.length} products · ${active} active`}
        action={
          <Link href="/admin/products/new" className="admin-button admin-button--primary">
            <Plus size={14} aria-hidden="true" /> New product
          </Link>
        }
      />

      <section className="admin-panel">
        <DataTable
          caption="All products, with price, per-size inventory and publication status"
          columns={columns}
          rows={rows}
          getRowKey={(p) => p.id}
          onRowHref={(p) => `/admin/products/${p.id}`}
          empty="No products yet. Create the first one."
        />
      </section>
    </>
  )
}
