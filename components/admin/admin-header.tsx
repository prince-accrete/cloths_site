'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronRight, LogOut, Menu, Search, Store, UserRound } from 'lucide-react'

const LABELS: Record<string, string> = {
  admin: 'Dashboard',
  products: 'Products',
  orders: 'Orders',
  customers: 'Customers',
  settings: 'Settings',
}

/** `/admin/products/pima` → Dashboard / Products / pima */
function useCrumbs() {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean)
  return parts.map((part, i) => ({
    label: LABELS[part] ?? part,
    href: `/${parts.slice(0, i + 1).join('/')}`,
    last: i === parts.length - 1,
  }))
}

export function AdminHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const crumbs = useCrumbs()
  const searchRef = useRef<HTMLInputElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cmd+K / Ctrl+K focuses search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Dismiss the profile menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <header className="admin-header">
      <button
        type="button"
        className="admin-icon-button admin-header__burger"
        onClick={onOpenMenu}
        aria-label="Open menu"
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      <nav className="admin-crumbs" aria-label="Breadcrumb">
        <ol>
          {crumbs.map((crumb) => (
            <li key={crumb.href}>
              {crumb.last ? (
                <span aria-current="page">{crumb.label}</span>
              ) : (
                <>
                  <Link href={crumb.href}>{crumb.label}</Link>
                  <ChevronRight size={12} aria-hidden="true" />
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="admin-search">
        <Search size={15} aria-hidden="true" />
        <label htmlFor="admin-search" className="sr-only">
          Search the admin
        </label>
        <input
          id="admin-search"
          ref={searchRef}
          type="search"
          placeholder="Search orders, products…"
          autoComplete="off"
        />
        <kbd aria-hidden="true">⌘K</kbd>
      </div>

      <div className="admin-profile" ref={menuRef}>
        <button
          type="button"
          className="admin-profile__trigger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <UserRound size={15} aria-hidden="true" />
          <span>Prince</span>
        </button>

        {menuOpen && (
          <div className="admin-menu" role="menu">
            <Link href="/" role="menuitem" className="admin-menu__item">
              <Store size={14} aria-hidden="true" /> View storefront
            </Link>
            <button type="button" role="menuitem" className="admin-menu__item">
              <LogOut size={14} aria-hidden="true" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
