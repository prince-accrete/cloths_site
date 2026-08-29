import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getOrderById, listActiveProducts } from '@/lib/admin/store'
import { ORDER_STATUS_LABEL, PAYMENT_LABEL, orderTotal } from '@/lib/admin/types'
import { Reveal } from '@/components/site/reveal'

export const metadata: Metadata = { title: 'Order' }

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`

/**
 * Order receipt.
 *
 * Reachable by anyone holding the id, which is deliberate — guests check out
 * without an account and still need to see their order. The ids are sequential
 * though, so before real traffic this should move to an unguessable token.
 */
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [order, products] = await Promise.all([getOrderById(id), listActiveProducts()])
  if (!order) notFound()

  const name = (productId: string) =>
    products.find((p) => p.id === productId)?.name ?? productId

  return (
    <div className="shell" style={{ paddingTop: 'clamp(6.5rem, 12vw, 9rem)' }}>
      <div className="order">
        <Reveal as="span" className="eyebrow">
          Order {order.id}
        </Reveal>
        <h1 className="display display--sm" style={{ margin: '0.8rem 0 1.6rem' }}>
          {ORDER_STATUS_LABEL[order.status]}.
        </h1>

        <dl className="order__meta">
          <div>
            <dt className="eyebrow">Placed</dt>
            <dd>
              {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
                new Date(order.placedAt),
              )}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Payment</dt>
            <dd>{order.payment ? PAYMENT_LABEL[order.payment.method] : 'Cash on delivery'}</dd>
          </div>
          {order.address && (
            <div>
              <dt className="eyebrow">Delivering to</dt>
              <dd>
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ''}
                <br />
                {order.address.city}, {order.address.state} {order.address.pincode}
                <br />
                {order.address.phone}
              </dd>
            </div>
          )}
        </dl>

        <ul className="order__lines" role="list">
          {order.lines.map((line) => (
            <li key={`${line.productId}-${line.size}`}>
              <span>
                {name(line.productId)}
                <small>
                  Size {line.size} · Qty {line.qty}
                </small>
              </span>
              <b>{rupees(line.unitPrice * line.qty)}</b>
            </li>
          ))}
        </ul>

        <div className="order__total">
          <span className="eyebrow">Total</span>
          <strong>{rupees(orderTotal(order))}</strong>
        </div>

        <Link href="/shop" className="text-link">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
