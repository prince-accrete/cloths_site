'use server'

import { revalidatePath } from 'next/cache'
import { SIZES, type Size } from '@/lib/products'
import { setOrderStatus, updateProduct, type ProductPatch } from './store'
import type { Inventory, OrderStatus, ProductStatus } from './types'
// A 'use server' module may only export async functions, so the state shape
// and its initial value live in a plain module.
import type { FormState } from './form-state'
import { getAdminSession } from '@/lib/auth-guard'

const FITS = ['Regular Fit', 'Relaxed Fit', 'Oversized'] as const

/**
 * Validate and save a product.
 *
 * Signature matches `useActionState` — (prevState, formData) => newState — so
 * the form works without JavaScript and progressively enhances with pending
 * state once hydrated.
 */
export async function saveProductAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Server actions are independently callable HTTP endpoints — middleware and
  // the page guard do not protect them. This check is the one that counts.
  if (!(await getAdminSession())) {
    return { ok: false, message: 'Not authorised.', errors: {} }
  }

  const id = String(formData.get('id') ?? '')
  const errors: Record<string, string> = {}

  const name = String(formData.get('name') ?? '').trim()
  if (name.length < 2) errors.name = 'Name must be at least 2 characters.'

  const priceRaw = String(formData.get('price') ?? '').trim()
  const price = Number(priceRaw)
  if (!priceRaw || !Number.isFinite(price) || price <= 0) {
    errors.price = 'Enter a price greater than zero.'
  }

  const fit = String(formData.get('fit') ?? '') as ProductPatch['fit']
  if (!FITS.includes(fit)) errors.fit = 'Choose a fit.'

  const color = String(formData.get('color') ?? '').trim()
  if (!color) errors.color = 'Colour is required.'

  const fabric = String(formData.get('fabric') ?? '').trim()
  if (!fabric) errors.fabric = 'Fabric is required.'

  const status = String(formData.get('status') ?? 'draft') as ProductStatus
  const tagline = String(formData.get('tagline') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()

  // Inventory: a size is carried only when its "carried" checkbox is on.
  const inventory: Inventory = {}
  for (const size of SIZES) {
    if (formData.get(`carry-${size}`) !== 'on') continue
    const qty = Number(String(formData.get(`qty-${size}`) ?? '0'))
    if (!Number.isFinite(qty) || qty < 0) {
      errors[`qty-${size}`] = 'Must be zero or more.'
      continue
    }
    inventory[size as Size] = Math.floor(qty)
  }
  if (Object.keys(inventory).length === 0) {
    errors.inventory = 'Carry at least one size.'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: 'Fix the highlighted fields.', errors }
  }

  const saved = await updateProduct(id, {
    name,
    price,
    fit,
    color,
    fabric,
    tagline,
    description,
    status,
    inventory,
  })

  if (!saved) {
    return { ok: false, message: 'That product no longer exists.', errors: {} }
  }

  // The storefront reads the same catalogue, so refresh both sides.
  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}`)
  revalidatePath('/shop')
  revalidatePath(`/product/${id}`)

  return { ok: true, message: `Saved “${saved.name}”.`, errors: {} }
}

export async function setOrderStatusAction(formData: FormData) {
  if (!(await getAdminSession())) return

  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '') as OrderStatus
  if (!['pending', 'fulfilled', 'cancelled'].includes(status)) return
  await setOrderStatus(id, status)
  revalidatePath('/admin/orders')
  revalidatePath('/admin')
}
