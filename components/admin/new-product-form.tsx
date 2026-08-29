'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { SIZES, type Size } from '@/lib/products'
import { createProductAction } from '@/lib/admin/actions'
import { EMPTY_FORM_STATE } from '@/lib/admin/form-state'

const FITS = ['Regular Fit', 'Relaxed Fit', 'Oversized'] as const

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="admin-field" data-invalid={error ? 'true' : undefined}>
      <label className="admin-eyebrow" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="admin-sub">{hint}</p>}
      {error && (
        <p className="admin-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function NewProductForm() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(createProductAction, EMPTY_FORM_STATE)
  const [carried, setCarried] = useState<Record<Size, boolean>>(
    () => Object.fromEntries(SIZES.map((s) => [s, s !== 'XXL'])) as Record<Size, boolean>,
  )

  // Straight to the editor once it exists, so images and details can be filled in.
  useEffect(() => {
    if (state.ok && state.createdId) router.push(`/admin/products/${state.createdId}`)
  }, [state.ok, state.createdId, router])

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-form__grid">
        <section className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="admin-eyebrow">Details</h2>
          </div>

          <Field
            label="Name"
            htmlFor="name"
            error={state.errors.name}
            hint="The URL is derived from this — “The Linen Tee” becomes /product/the-linen-tee."
          >
            <input id="name" name="name" required autoFocus />
          </Field>

          <div className="admin-form__row">
            <Field label="Price (INR)" htmlFor="price" error={state.errors.price}>
              <input id="price" name="price" type="number" min="1" step="1" inputMode="numeric" required />
            </Field>
            <Field label="Fit" htmlFor="fit" error={state.errors.fit}>
              <select id="fit" name="fit" defaultValue="Regular Fit">
                {FITS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="admin-form__row">
            <Field label="Colour" htmlFor="color" error={state.errors.color}>
              <input id="color" name="color" required placeholder="Bone" />
            </Field>
            <Field label="Fabric" htmlFor="fabric" error={state.errors.fabric}>
              <input id="fabric" name="fabric" required placeholder="Organic combed cotton" />
            </Field>
          </div>

          <Field label="Tagline" htmlFor="tagline">
            <input id="tagline" name="tagline" placeholder="Structure that holds its shape." />
          </Field>

          <Field label="Description" htmlFor="description">
            <textarea id="description" name="description" rows={4} />
          </Field>
        </section>

        <div className="admin-form__side">
          <section className="admin-panel">
            <div className="admin-panel__head">
              <h2 className="admin-eyebrow">Status</h2>
            </div>
            <Field label="Visibility" htmlFor="status">
              <select id="status" name="status" defaultValue="draft">
                <option value="draft">Draft — hidden</option>
                <option value="active">Active — visible in the shop</option>
              </select>
            </Field>
          </section>

          <section className="admin-panel">
            <div className="admin-panel__head">
              <h2 className="admin-eyebrow">Images</h2>
            </div>

            {/* URLs, not uploads. There is no storage provider wired up, and a
                fake upload button that silently does nothing would be worse. */}
            <Field label="Image 1 URL" htmlFor="image1" error={state.errors.image1}>
              <input id="image1" name="image1" type="url" placeholder="https://images.unsplash.com/photo-…" required />
            </Field>
            <Field label="Image 1 alt text" htmlFor="alt1">
              <input id="alt1" name="alt1" placeholder="What the photograph shows" />
            </Field>

            <Field label="Image 2 URL" htmlFor="image2" error={state.errors.image2}>
              <input id="image2" name="image2" type="url" placeholder="https://images.unsplash.com/photo-…" />
            </Field>
            <Field label="Image 2 alt text" htmlFor="alt2">
              <input id="alt2" name="alt2" />
            </Field>

            <p className="admin-sub">
              Only images.unsplash.com is allowed — next.config.mjs permits that host alone, so any
              other URL renders broken.
            </p>
          </section>

          <section className="admin-panel">
            <div className="admin-panel__head">
              <h2 className="admin-eyebrow">Sizes &amp; stock</h2>
            </div>

            {state.errors.inventory && (
              <p className="admin-field__error" role="alert">
                {state.errors.inventory}
              </p>
            )}

            <ul className="admin-sizes" role="list">
              {SIZES.map((size) => (
                <li className="admin-sizes__row" key={size} data-on={carried[size] || undefined}>
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      name={`carry-${size}`}
                      checked={carried[size]}
                      onChange={(e) => setCarried((p) => ({ ...p, [size]: e.target.checked }))}
                    />
                    <span>{size}</span>
                  </label>
                  <label className="sr-only" htmlFor={`qty-${size}`}>
                    Quantity in stock for size {size}
                  </label>
                  <input
                    id={`qty-${size}`}
                    name={`qty-${size}`}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    disabled={!carried[size]}
                    defaultValue={10}
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="admin-form__bar">
        <p className="admin-form__status" role="status">
          {state.message && (
            <span data-ok={state.ok || undefined}>
              {state.ok && <Check size={14} aria-hidden="true" />} {state.message}
            </span>
          )}
        </p>
        <button type="submit" className="admin-button admin-button--primary" disabled={pending}>
          {pending && <Loader2 size={14} className="admin-spin" aria-hidden="true" />}
          {pending ? 'Creating…' : 'Create product'}
        </button>
      </div>
    </form>
  )
}
