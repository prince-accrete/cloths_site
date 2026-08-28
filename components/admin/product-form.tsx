'use client'

import Image from 'next/image'
import { useActionState, useState } from 'react'
import { Check, ImagePlus, Loader2 } from 'lucide-react'
import { SIZES, type Size } from '@/lib/products'
import { saveProductAction } from '@/lib/admin/actions'
import { EMPTY_FORM_STATE } from '@/lib/admin/form-state'
import type { AdminProduct } from '@/lib/admin/types'

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

export function ProductForm({ product }: { product: AdminProduct }) {
  const [state, formAction, pending] = useActionState(saveProductAction, EMPTY_FORM_STATE)

  // Which sizes are carried is client state so the quantity inputs can enable
  // and disable live; the server re-derives it from the submitted checkboxes.
  const [carried, setCarried] = useState<Record<Size, boolean>>(
    () =>
      Object.fromEntries(
        SIZES.map((s) => [s, product.inventory[s] !== undefined]),
      ) as Record<Size, boolean>,
  )

  return (
    <form action={formAction} className="admin-form">
      <input type="hidden" name="id" value={product.id} />

      <div className="admin-form__grid">
        <section className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="admin-eyebrow">Details</h2>
          </div>

          <Field label="Name" htmlFor="name" error={state.errors.name}>
            <input id="name" name="name" defaultValue={product.name} required />
          </Field>

          <div className="admin-form__row">
            <Field label="Price (USD)" htmlFor="price" error={state.errors.price}>
              <input
                id="price"
                name="price"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                defaultValue={product.price}
                required
              />
            </Field>

            <Field label="Fit" htmlFor="fit" error={state.errors.fit}>
              <select id="fit" name="fit" defaultValue={product.fit}>
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
              <input id="color" name="color" defaultValue={product.color} required />
            </Field>

            <Field label="Fabric" htmlFor="fabric" error={state.errors.fabric}>
              <input id="fabric" name="fabric" defaultValue={product.fabric} required />
            </Field>
          </div>

          <Field
            label="Tagline"
            htmlFor="tagline"
            hint="One line, shown under the product name."
          >
            <input id="tagline" name="tagline" defaultValue={product.tagline} />
          </Field>

          <Field label="Description" htmlFor="description">
            <textarea id="description" name="description" rows={5} defaultValue={product.description} />
          </Field>
        </section>

        <div className="admin-form__side">
          <section className="admin-panel">
            <div className="admin-panel__head">
              <h2 className="admin-eyebrow">Status</h2>
            </div>
            <Field label="Visibility" htmlFor="status">
              <select id="status" name="status" defaultValue={product.status}>
                <option value="active">Active — visible in the shop</option>
                <option value="draft">Draft — hidden</option>
              </select>
            </Field>
          </section>

          <section className="admin-panel">
            <div className="admin-panel__head">
              <h2 className="admin-eyebrow">Images</h2>
              <span className="admin-sub">2 required</span>
            </div>
            <div className="admin-uploads">
              {[0, 1].map((i) => {
                const image = product.images[i]
                return (
                  <div className="admin-upload" key={i}>
                    {image ? (
                      <Image src={image.src} alt={image.alt} fill sizes="160px" />
                    ) : (
                      <span className="admin-upload__empty">
                        <ImagePlus size={18} aria-hidden="true" />
                      </span>
                    )}
                    <button type="button" className="admin-upload__action">
                      {image ? 'Replace' : 'Upload'}
                    </button>
                  </div>
                )
              })}
            </div>
            <p className="admin-sub">
              Upload is a placeholder — no storage provider is wired up yet.
            </p>
          </section>

          <section className="admin-panel">
            <div className="admin-panel__head">
              <h2 className="admin-eyebrow">Sizes & stock</h2>
            </div>

            {state.errors.inventory && (
              <p className="admin-field__error" role="alert">
                {state.errors.inventory}
              </p>
            )}

            <ul className="admin-sizes" role="list">
              {SIZES.map((size) => {
                const on = carried[size]
                return (
                  <li className="admin-sizes__row" key={size} data-on={on || undefined}>
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        name={`carry-${size}`}
                        checked={on}
                        onChange={(e) =>
                          setCarried((prev) => ({ ...prev, [size]: e.target.checked }))
                        }
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
                      disabled={!on}
                      defaultValue={product.inventory[size] ?? 0}
                      aria-describedby={state.errors[`qty-${size}`] ? `err-${size}` : undefined}
                    />
                    {state.errors[`qty-${size}`] && (
                      <p className="admin-field__error" id={`err-${size}`} role="alert">
                        {state.errors[`qty-${size}`]}
                      </p>
                    )}
                  </li>
                )
              })}
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
          {pending ? 'Saving…' : 'Save product'}
        </button>
      </div>
    </form>
  )
}
