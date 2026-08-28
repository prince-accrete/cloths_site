'use client'

import { useState } from 'react'
import { ArrowRight, Heart, Minus, Plus } from 'lucide-react'
import { SIZES, type Product, type Size } from '@/lib/products'
import { useStore } from '@/lib/store'

export function BuyPanel({ product }: { product: Product }) {
  const { add, isWished, toggleWish, hydrated } = useStore()
  const [size, setSize] = useState<Size | null>(null)
  const [qty, setQty] = useState(1)
  const [error, setError] = useState(false)

  const wished = hydrated && isWished(product.id)

  const submit = () => {
    if (!size) {
      setError(true)
      return
    }
    add(product.id, size, qty)
    setQty(1)
  }

  return (
    <>
      <div className="field">
        <div className="field__head">
          <span className="eyebrow">Size</span>
          <button className="link-quiet" type="button">
            Size guide
          </button>
        </div>

        <div className="size-grid" role="group" aria-label="Choose a size">
          {SIZES.map((s) => {
            const available = product.sizes.includes(s)
            return (
              <button
                key={s}
                type="button"
                disabled={!available}
                aria-pressed={size === s}
                aria-label={available ? `Size ${s}` : `Size ${s}, sold out`}
                onClick={() => {
                  setSize(s)
                  setError(false)
                }}
              >
                {s}
              </button>
            )
          })}
        </div>

        {error && (
          <p className="meta" style={{ color: 'var(--accent)' }} role="alert">
            Choose a size first.
          </p>
        )}
      </div>

      <div className="field">
        <span className="eyebrow">Quantity</span>
        <div className="qty">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={13} />
          </button>
          <output aria-label="Quantity">{qty}</output>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            disabled={qty >= 10}
            aria-label="Increase quantity"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      <div className="pdp__actions">
        <button className="button button--dark" onClick={submit}>
          Add to bag — ${product.price * qty} <ArrowRight size={15} />
        </button>
        <button
          className="pdp__wish"
          onClick={() => toggleWish(product.id)}
          aria-pressed={wished}
          aria-label={`${wished ? 'Remove' : 'Save'} ${product.name} ${wished ? 'from' : 'to'} wishlist`}
        >
          <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>
    </>
  )
}
