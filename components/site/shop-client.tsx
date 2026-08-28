'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { products, FITS } from '@/lib/products'
import { useStore } from '@/lib/store'
import { ProductCard } from './product-card'
import { StaggerGrid, StaggerItem } from './stagger-grid'
import { WeightScrubber } from './weight-scrubber'

type Sort = 'featured' | 'low' | 'high' | 'new'

export function ShopClient({
  initialSort = 'featured',
  wishlistOnly = false,
}: {
  initialSort?: Sort
  wishlistOnly?: boolean
}) {
  const { wishes, hydrated } = useStore()
  const [fits, setFits] = useState<string[]>([])
  const [sort, setSort] = useState<Sort>(initialSort)
  /** null until the scrubber is touched, so it never hijacks the default view. */
  const [gsm, setGsm] = useState<number | null>(null)

  const shown = useMemo(() => {
    let list = products
    if (wishlistOnly) list = list.filter((p) => wishes.includes(p.id))
    if (fits.length) list = list.filter((p) => fits.includes(p.fit))

    const sorted = [...list]
    // The scrubber outranks the sort dropdown while engaged: order by how
    // close each fabric is to the chosen weight. Nothing is filtered out.
    if (gsm !== null) {
      sorted.sort((a, b) => Math.abs(a.gsm - gsm) - Math.abs(b.gsm - gsm))
      return sorted
    }
    if (sort === 'low') sorted.sort((a, b) => a.price - b.price)
    if (sort === 'high') sorted.sort((a, b) => b.price - a.price)
    if (sort === 'new') sorted.sort((a, b) => Number(b.badge === 'New') - Number(a.badge === 'New'))
    return sorted
  }, [fits, sort, wishlistOnly, wishes, gsm])

  const toggleFit = (fit: string) =>
    setFits((prev) => (prev.includes(fit) ? prev.filter((f) => f !== fit) : [...prev, fit]))

  // The wishlist is client state, so render nothing definitive until hydrated.
  const loading = wishlistOnly && !hydrated

  return (
    <>
      {!wishlistOnly && (
        <WeightScrubber value={gsm} onChange={setGsm} onReset={() => setGsm(null)} />
      )}

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
            <StaggerItem key={product.id} reorder={gsm !== null}>
              <ProductCard
                product={product}
                index={i % 4}
                priority={i < 4}
                match={gsm !== null && i === 0 ? `Closest to ${gsm} GSM` : undefined}
              />
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
