'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useStore } from '@/lib/store'
import { DialogShell } from './dialog-shell'

const SUGGESTIONS = ['Heavyweight', 'Oversized', 'Bone', 'Moss', 'Pima']

export function SearchOverlay() {
  // Same catalogue snapshot the cart uses — no second source of truth.
  const { searchOpen, setSearchOpen, products } = useStore()
  const [query, setQuery] = useState('')
  const close = () => setSearchOpen(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return products.filter((p) =>
      [p.name, p.color, p.fit, p.fabric].some((field) => field.toLowerCase().includes(q)),
    )
  }, [query, products])

  return (
    <DialogShell
      open={searchOpen}
      onClose={close}
      label="Search the collection"
      className="search"
      backdrop={false}
      variant="sheet"
    >
      <div className="search__top">
        <Link href="/" className="wordmark" onClick={close}>
          STILL FITS<sup>®</sup>
        </Link>
        <button className="icon-button" onClick={close} aria-label="Close search">
          <X size={20} />
        </button>
      </div>

      <div className="search__inner">
        <span className="eyebrow">Search the collection</span>

        <div className="search__field">
          <Search size={22} strokeWidth={1.3} />
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <input
            id="site-search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “heavyweight” or “bone”"
            autoComplete="off"
          />
        </div>

        {query.trim() === '' ? (
          <div className="search__hint">
            <span className="eyebrow">Suggested</span>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => setQuery(s)}>
                {s}
              </button>
            ))}
          </div>
        ) : (
          <div className="search__results">
            <p className="sr-only" role="status">
              {results.length} results for {query}
            </p>
            {results.map((p, i) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="search__result"
                onClick={close}
                style={{ '--i': i } as React.CSSProperties}
              >
                <Image src={p.images[0].src} alt="" width={48} height={60} />
                <span>
                  {p.name}
                  <span className="meta"> — {p.color}</span>
                </span>
                <span>${p.price}</span>
              </Link>
            ))}
            {results.length === 0 && (
              <div className="empty">
                <p>Nothing for “{query}”.</p>
                <button className="text-link" onClick={() => setQuery('')}>
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DialogShell>
  )
}
