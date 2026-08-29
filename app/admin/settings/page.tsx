import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/page-header'
import { requireAdmin } from '@/lib/auth-guard'

export const metadata: Metadata = { title: 'Settings' }

const ROWS = [
  { label: 'Store name', value: 'Still Fits' },
  { label: 'Currency', value: 'USD — duties included' },
  { label: 'Free shipping threshold', value: '$150' },
  { label: 'Returns window', value: '30 days' },
  { label: 'Low stock threshold', value: '6 units' },
]

export default async function AdminSettingsPage() {
  await requireAdmin()

  return (
    <>
      <PageHeader eyebrow="Configuration" title="Settings" meta="Store-wide defaults" />
      <section className="admin-panel">
        <dl className="admin-settings">
          {ROWS.map((row) => (
            <div key={row.label}>
              <dt className="admin-eyebrow">{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="admin-sub">
          Read-only until a settings store exists — these values are currently
          constants in the storefront and admin code.
        </p>
      </section>
    </>
  )
}
