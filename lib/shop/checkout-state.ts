/**
 * Checkout form state.
 *
 * Separate from actions.ts because a 'use server' module may only export async
 * functions — exporting a constant from one makes React treat it as a server
 * reference rather than a value.
 */
export type CheckoutState = {
  ok: boolean
  message: string
  errors: Record<string, string>
  orderId?: string
}

export const EMPTY_CHECKOUT: CheckoutState = { ok: false, message: '', errors: {} }
