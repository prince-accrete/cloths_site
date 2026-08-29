'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef } from 'react'
import { ArrowRight, Check, Loader2, Lock } from 'lucide-react'
import { useStore } from '@/lib/store'
import { checkoutAction } from '@/lib/shop/actions'
import { EMPTY_CHECKOUT } from '@/lib/shop/checkout-state'

const FREE_DELIVERY_OVER = 1500
const DELIVERY_FEE = 99

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`

function Field({
  label,
  name,
  error,
  type = 'text',
  required = true,
  autoComplete,
  placeholder,
  defaultValue,
  half,
}: {
  label: string
  name: string
  error?: string
  type?: string
  required?: boolean
  autoComplete?: string
  placeholder?: string
  defaultValue?: string
  half?: boolean
}) {
  return (
    <div className="co-field" data-half={half || undefined} data-invalid={error ? 'true' : undefined}>
      <label className="eyebrow" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
      {error && (
        <p className="co-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/** Empties the bag exactly once, after a confirmed order. */
function ClearBag({ onDone }: { onDone: () => void }) {
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    onDone()
  }, [onDone])
  return null
}

export function CheckoutForm({
  signedInEmail,
  signedInName,
}: {
  signedInEmail?: string
  signedInName?: string
}) {
  const { items, subtotal, count, clear } = useStore()
  const [state, formAction, pending] = useActionState(checkoutAction, EMPTY_CHECKOUT)

  if (state.ok && state.orderId) {
    return (
      <div className="co-done">
        <ClearBag onDone={clear} />
        <span className="eyebrow">Order placed</span>
        <h1 className="display display--sm">Thank you.</h1>
        <p className="lede">
          Order <strong>{state.orderId}</strong> is confirmed. You pay in cash when it arrives.
        </p>
        <div className="co-done__actions">
          <Link href={`/order/${state.orderId}`} className="button button--dark">
            View order <ArrowRight size={15} />
          </Link>
          <Link href="/shop" className="text-link">
            Keep shopping
          </Link>
        </div>
      </div>
    )
  }

  if (count === 0) {
    return (
      <div className="empty">
        <p>Your bag is empty.</p>
        <Link href="/shop" className="text-link">
          Browse the collection <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  const delivery = subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE

  return (
    <form action={formAction} className="co">
      {/* The cart lives in localStorage, so it travels with the form. Prices
          are re-read from the database server-side, so what is sent here
          cannot influence what is charged. */}
      <input
        type="hidden"
        name="lines"
        value={JSON.stringify(
          items.map(({ line }) => ({
            productId: line.productId,
            size: line.size,
            qty: line.qty,
          })),
        )}
      />

      <div className="co__main">
        <section className="co__block">
          <h2 className="eyebrow">Contact</h2>
          <Field
            label="Full name"
            name="name"
            autoComplete="name"
            defaultValue={signedInName}
            error={state.errors.name}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={signedInEmail}
            error={state.errors.email}
          />
          <Field
            label="Mobile"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="9876543210"
            error={state.errors.phone}
          />
        </section>

        <section className="co__block">
          <h2 className="eyebrow">Delivery address</h2>
          <Field label="Address" name="line1" autoComplete="address-line1" error={state.errors.line1} />
          <Field
            label="Apartment, landmark (optional)"
            name="line2"
            required={false}
            autoComplete="address-line2"
          />
          <div className="co__row">
            <Field label="City" name="city" half autoComplete="address-level2" error={state.errors.city} />
            <Field label="State" name="state" half autoComplete="address-level1" error={state.errors.state} />
          </div>
          <Field
            label="Pincode"
            name="pincode"
            half
            autoComplete="postal-code"
            placeholder="400001"
            error={state.errors.pincode}
          />
        </section>

        <section className="co__block">
          <h2 className="eyebrow">Payment</h2>

          <label className="co__pay">
            <input type="radio" name="payment" value="cod" defaultChecked />
            <span>
              <strong>Cash on delivery</strong>
              <small>Pay the courier when your order arrives.</small>
            </span>
          </label>

          {/* Disabled in the UI and rejected again server-side — a disabled
              input is a hint, not a guarantee. */}
          <label className="co__pay" data-disabled="true">
            <input type="radio" name="payment" value="online" disabled />
            <span>
              <strong>
                Card, UPI &amp; netbanking <em>— coming soon</em>
              </strong>
              <small>Online payment is not enabled yet.</small>
            </span>
            <Lock size={14} aria-hidden="true" />
          </label>

          {state.errors.payment && (
            <p className="co-error" role="alert">
              {state.errors.payment}
            </p>
          )}
        </section>
      </div>

      <aside className="co__summary">
        <h2 className="eyebrow">Your bag</h2>

        <ul className="co__lines" role="list">
          {items.map(({ line, product }) => (
            <li key={`${line.productId}-${line.size}`}>
              <span>
                {product.name}
                <small>
                  {line.size} × {line.qty}
                </small>
              </span>
              <b>{rupees(product.price * line.qty)}</b>
            </li>
          ))}
        </ul>

        <div className="co__total">
          <span>Subtotal</span>
          <b>{rupees(subtotal)}</b>
        </div>
        <div className="co__total co__total--muted">
          <span>Delivery</span>
          <b>{delivery === 0 ? 'Free' : rupees(delivery)}</b>
        </div>
        <div className="co__total co__total--grand">
          <span>Total</span>
          <b>{rupees(subtotal + delivery)}</b>
        </div>

        {state.message && !state.ok && (
          <p className="co-error" role="alert">
            {state.message}
          </p>
        )}

        <button type="submit" className="button button--dark button--block" disabled={pending}>
          {pending ? <Loader2 size={15} className="admin-spin" aria-hidden="true" /> : <Check size={15} />}
          {pending ? 'Placing order…' : 'Place order'}
        </button>
        <p className="meta">You pay in cash on delivery. No card details are taken.</p>
      </aside>
    </form>
  )
}
