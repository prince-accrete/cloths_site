'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useStore } from '@/lib/store'
import type { Product } from '@/lib/products'

export function ProductCard({
  product,
  index = 0,
  sizes = '(max-width: 860px) 50vw, (max-width: 1100px) 33vw, 25vw',
  priority = false,
  match,
}: {
  product: Product
  index?: number
  sizes?: string
  priority?: boolean
  /** Set by the weight scrubber on the nearest fabric match. */
  match?: string
}) {
  const { isWished, toggleWish, add, hydrated } = useStore()
  const wished = hydrated && isWished(product.id)
  const [primary, secondary] = product.images

  return (
    <article className="product-card" style={{ '--i': index } as React.CSSProperties}>
      {/* No data-reveal here: the grid stagger (stagger-grid.tsx) already
          animates this card. Stacking both breaks the excessive-motion rule
          of 1-2 animated elements per view. */}
      <div className="product-card__media">
        <Link href={`/product/${product.id}`} aria-label={product.name}>
          <Image src={primary.src} alt={primary.alt} fill sizes={sizes} priority={priority} />
          {secondary && <Image src={secondary.src} alt="" fill sizes={sizes} aria-hidden="true" />}
        </Link>

        {match ? (
          <span className="product-card__badge product-card__badge--match">{match}</span>
        ) : (
          product.badge && <span className="product-card__badge">{product.badge}</span>
        )}

        <button
          className="product-card__wish"
          onClick={() => toggleWish(product.id)}
          aria-pressed={wished}
          aria-label={`${wished ? 'Remove' : 'Save'} ${product.name} ${wished ? 'from' : 'to'} wishlist`}
        >
          <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
        </button>

        {/* Sizes rather than a generic "quick add" — one fewer step to the bag. */}
        <div className="quick-add">
          {product.sizes.slice(0, 5).map((size) => (
            <button
              key={size}
              onClick={() => add(product.id, size)}
              aria-label={`Add ${product.name}, size ${size}, to bag`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="product-card__meta">
        <div>
          <h3>
            <Link href={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <p>
            <span className="swatch" style={{ background: product.swatch }} aria-hidden="true" />
            {product.color} · {product.fit}
          </p>
        </div>
        <span className="product-card__price">${product.price}</span>
      </div>
    </article>
  )
}
