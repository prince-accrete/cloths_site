'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useStore } from '@/lib/store'

const LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?sort=new', label: 'New arrivals' },
  { href: '/about', label: 'About' },
]

export function Nav() {
  const pathname = usePathname()
  const { count, wishes, hydrated, setCartOpen, setSearchOpen } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Only the home page has a full-bleed hero for the nav to float over.
  const overHero = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    if (menuOpen) document.body.dataset.locked = 'true'
    else delete document.body.dataset.locked
  }, [menuOpen])

  const solid = !overHero || scrolled || menuOpen

  return (
    <header className="nav shell" data-solid={solid}>
      <div className="nav__inner">
        <button
          className="icon-button nav__burger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>

        <Link href="/" className="wordmark">
          STILL FITS<sup>®</sup>
        </Link>

        <nav className="nav__links" data-open={menuOpen} aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="nav__link"
              aria-current={pathname === link.href.split('?')[0] ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav__actions">
          <button className="icon-button" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search size={18} />
          </button>

          <Link href="/shop?view=wishlist" className="icon-button desktop-only" aria-label="Wishlist">
            <Heart size={18} />
            <span className="count">{hydrated ? wishes.length : 0}</span>
          </Link>

          <Link href="/account" className="icon-button desktop-only" aria-label="Account">
            <UserRound size={18} />
          </Link>

          <button
            className="icon-button"
            onClick={() => setCartOpen(true)}
            aria-label={`Shopping bag, ${hydrated ? count : 0} items`}
          >
            <ShoppingBag size={18} />
            <span className="count">{hydrated ? count : 0}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
