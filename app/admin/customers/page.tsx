import type { Metadata } from 'next'
import { listCustomers } from '@/lib/admin/store'
import { DataTable, type Column } from '@/components/admin/data-table'
import { PageHeader } from '@/components/admin/page-header'

// Reads MongoDB per request — never prerendered at build time.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Customers' }

type Row = Awaited<ReturnType<typeof listCustomers>>[number]

const columns: Column<Row>[] = [
  {
    key: 'name',
    header: 'Customer',
    cell: (c) => (
      <>
        {c.name}
        <span className="admin-sub">{c.email}</span>
      </>
    ),
  },
  { key: 'orders', header: 'Orders', align: 'end', numeric: true, width: '92px', cell: (c) => c.orders },
  {
    key: 'spent',
    header: 'Lifetime value',
    align: 'end',
    numeric: true,
    width: '132px',
    cell: (c) => `$${c.spent}`,
  },
]

export default async function AdminCustomersPage() {
  const rows = await listCustomers()
  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Customers"
        meta={`${rows.length} customers with at least one non-cancelled order`}
      />
      <section className="admin-panel">
        <DataTable
          caption="Customers ranked by lifetime value"
          columns={columns}
          rows={rows}
          getRowKey={(c) => c.email}
          empty="No customers yet."
        />
      </section>
    </>
  )
}
