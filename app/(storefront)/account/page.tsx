import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { auth } from '@/lib/auth'
import { listOrdersForUser, listActiveProducts } from '@/lib/admin/store'
import { ORDER_STATUS_LABEL, orderTotal } from '@/lib/admin/types'
import { Lines, Reveal } from '@/components/site/reveal'
import { SignOutButton } from '@/components/site/sign-out-button'

export const metadata: Metadata = { title: 'Account' }

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login?from=/account')

  const [orders, products] = await Promise.all([
    listOrdersForUser(session.user.id),
    listActiveProducts(),
  ])

  const name = (id: string) => products.find((p) => p.id === id)?.name ?? id

  return (
    <div className="shell">
      <div className="page-head">
        <div className="section-head__title">
          <Reveal as="span" className="eyebrow">
            Still Fits / Account
          </Reveal>
          <h1 className="display display--md">
            <Lines lines={[session.user.name || 'Your account']} enter />
          </h1>
          <p className="meta">{session.user.email}</p>
        </div>
        <div className="section-head__aside">
          <SignOutButton />
        </div>
      </div>

      <section className="section-head">
        <div className="section-head__title">
          <span className="eyebrow">Order history</span>
        </div>
      </section>

      {orders.length === 0 ? (
        <div className="empty">
          <p>No orders yet.</p>
          <Link href="/shop" className="text-link">
            Browse the collection <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <ul className="account__orders" role="list">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/order/${order.id}`}>
                <span className="account__id">{order.id}</span>
                <span className="account__when">
                  {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
                    new Date(order.placedAt),
                  )}
                </span>
                <span className="account__what">
                  {order.lines.map((l) => `${name(l.productId)} (${l.size})`).join(', ')}
                </span>
                <span className="account__status">{ORDER_STATUS_LABEL[order.status]}</span>
                <span className="account__total">{rupees(orderTotal(order))}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
