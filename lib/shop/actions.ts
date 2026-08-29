"use server"

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { placeOrder, subscribe } from '@/lib/admin/store'
import type { CheckoutState } from './checkout-state'
import type { OrderLine } from '@/lib/admin/types'
import type { Size } from '@/lib/products'

const REQUIRED = ['name', 'email', 'line1', 'city', 'state', 'pincode', 'phone'] as const

/**
 * Places an order.
 *
 * Cash on delivery only. The online option is deliberately rejected here as
 * well as disabled in the form — a disabled input is a UI hint, not a
 * guarantee, and the payload can be posted directly.
 *
 * The cart lives in the browser, so line items arrive in the form body. Prices
 * are NOT taken from that payload: they are re-read from the catalogue inside
 * placeOrder, otherwise anyone could post their own unitPrice.
 */
export async function checkoutAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const errors: Record<string, string> = {}
  const get = (k: string) => String(formData.get(k) ?? '').trim()

  for (const field of REQUIRED) {
    if (!get(field)) errors[field] = 'Required.'
  }

  const email = get('email')
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Enter a valid email.'

  const phone = get('phone').replace(/\s+/g, '')
  if (phone && !/^(\+91)?[6-9]\d{9}$/.test(phone)) errors.phone = 'Enter a valid Indian mobile number.'

  const pincode = get('pincode')
  if (pincode && !/^\d{6}$/.test(pincode)) errors.pincode = 'A pincode is 6 digits.'

  const payment = get('payment')
  if (payment !== 'cod') {
    errors.payment = 'Online payment is not available yet — choose cash on delivery.'
  }

  let lines: OrderLine[] = []
  try {
    const parsed = JSON.parse(get('lines') || '[]') as { productId: string; size: Size; qty: number }[]
    lines = parsed
      .filter((l) => l && typeof l.productId === 'string' && Number.isFinite(l.qty) && l.qty > 0)
      .map((l) => ({ productId: l.productId, size: l.size, qty: Math.min(Math.floor(l.qty), 10), unitPrice: 0 }))
  } catch {
    errors.lines = 'Your bag could not be read. Refresh and try again.'
  }
  if (lines.length === 0 && !errors.lines) errors.lines = 'Your bag is empty.'

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: 'Check the highlighted fields.', errors }
  }

  const session = await auth.api.getSession({ headers: await headers() })

  const result = await placeOrder({
    lines,
    customer: { name: get('name'), email },
    address: {
      line1: get('line1'),
      line2: get('line2') || undefined,
      city: get('city'),
      state: get('state'),
      pincode,
      phone,
    },
    payment: 'cod',
    userId: session?.user?.id,
  })

  if (!result.ok) {
    return { ok: false, message: result.reason, errors: {} }
  }

  // Stock changed, so both the storefront and the admin are stale.
  revalidatePath('/', 'layout')
  revalidatePath('/admin')
  revalidatePath('/admin/orders')
  revalidatePath('/admin/products')

  return { ok: true, message: 'Order placed.', errors: {}, orderId: result.order.id }
}

/** Newsletter signup — now actually stored. */
export async function subscribeAction(_prev: { ok: boolean; message: string }, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, message: 'Enter a valid email address.' }
  }
  await subscribe(email)
  return { ok: true, message: 'You are on the list.' }
}
