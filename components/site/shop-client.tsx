'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { FITS, type Product } from '@/lib/products'
import { useStore } from '@/lib/store'
import { ProductCard } from './product-card'
import { StaggerGrid, StaggerItem } from './stagger-grid'

type Sort = 'featured' | 'low' | 'high' | 'new'

export function ShopClient({
  products,
  initialSort = 'featured',
  wishlistOnly = false,
}: {
  /** Passed from the server — client components cannot query Mongo. */
  products: Product[]
  initialSort?: Sort
  wishlistOnly?: boolean
}) {
  const { wishes, hydrated } = useStore()
  const [fits, setFits] = useState<string[]>([])
  const [sort, setSort] = useState<Sort>(initialSort)

  const shown = useMemo(() => {
    let list = products
    if (wishlistOnly) list = list.filter((p) => wishes.includes(p.id))
    if (fits.length) list = list.filter((p) => fits.includes(p.fit))

    const sorted = [...list]
    if (sort === 'low') sorted.sort((a, b) => a.price - b.price)
    if (sort === 'high') sorted.sort((a, b) => b.price - a.price)
    if (sort === 'new') sorted.sort((a, b) => Number(b.badge === 'New') - Number(a.badge === 'New'))
    return sorted
  }, [fits, sort, wishlistOnly, wishes, products])

  const toggleFit = (fit: string) =>
    setFits((prev) => (prev.includes(fit) ? prev.filter((f) => f !== fit) : [...prev, fit]))

  // The wishlist is client state, so render nothing definitive until hydrated.
  const loading = wishlistOnly && !hydrated

  return (
    <>
      <div className="toolbar">
        <div className="toolbar__group" role="group" aria-label="Filter by fit">
          <span className="meta" style={{ letterSpacing: 'var(--track-ui)' }}>
            Fit
          </span>
          {FITS.map((fit) => (
            <button
              key={fit}
              className="chip"
              aria-pressed={fits.includes(fit)}
              onClick={() => toggleFit(fit)}
            >
              {fit.replace(' Fit', '')}
            </button>
          ))}
          {fits.length > 0 && (
            <button className="link-quiet" onClick={() => setFits([])}>
              Clear
            </button>
          )}
        </div>

        <span className="toolbar__count" role="status">
          {loading ? '—' : `${shown.length} ${shown.length === 1 ? 'piece' : 'pieces'}`}
        </span>

        <label className="sr-only" htmlFor="sort">
          Sort products
        </label>
        <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="featured">Featured</option>
          <option value="new">Newest</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </div>

      {!loading && shown.length > 0 && (
        <StaggerGrid replayKey={`${fits.slice().sort().join('-')}|${sort}`}>
          {shown.map((product, i) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} index={i % 4} priority={i < 4} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}

      {!loading && shown.length === 0 && (
        <div className="empty">
          <p>{wishlistOnly ? 'Nothing saved yet.' : 'No pieces match those filters.'}</p>
          {wishlistOnly ? (
            <Link href="/shop" className="text-link">
              Browse the collection
            </Link>
          ) : (
            <button className="text-link" onClick={() => setFits([])}>
              Clear filters
            </button>
          )}
        </div>
      )}
    </>
  )
}
