/**
 * Shared form-state shape for the admin's `useActionState` forms.
 *
 * This lives OUTSIDE lib/admin/actions.ts on purpose: a `'use server'` module
 * may only export async functions. Exporting a plain object from one makes
 * React treat it as a server reference, so the initial state arrives as
 * something that is not the object and every `state.errors.*` read throws.
 */
export type FormState = {
  ok: boolean
  message: string
  /** Field name → error, rendered next to the input it belongs to. */
  errors: Record<string, string>
}

export const EMPTY_FORM_STATE: FormState = { ok: false, message: '', errors: {} }
