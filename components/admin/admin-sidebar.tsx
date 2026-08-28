'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronLeft,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Users,
  X,
} from 'lucide-react'

/** Mirrors --ease-out / --ease-in-out in globals.css §02. */
const EASE_OUT = [0.23, 1, 0.32, 1] as const
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** Match the path exactly — only Dashboard, which is a prefix of the rest. */
  exact?: boolean
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: Receipt },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

const STORAGE_KEY = 'purepath.admin.sidebar'

export function AdminSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Read the persisted collapse state after mount so server and client markup
  // match on the first render.
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === 'collapsed')
    } catch {
      /* private mode — the sidebar just starts expanded */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? 'collapsed' : 'expanded')
    } catch {
      /* ignore */
    }
  }, [collapsed, hydrated])

  // Close the mobile sheet on navigation and on Escape.
  useEffect(() => onCloseMobile(), [pathname, onCloseMobile])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseMobile()
    document.addEventListener('keydown', onKey)
    document.body.dataset.locked = 'true'
    return () => {
      document.removeEventListener('keydown', onKey)
      delete document.body.dataset.locked
    }
  }, [mobileOpen, onCloseMobile])

  const isCurrent = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  const nav = (
    <nav className="admin-nav" aria-label="Admin sections">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const current = isCurrent(href, exact)
        return (
          <Link
            key={href}
            href={href}
            className="admin-nav__link"
            aria-current={current ? 'page' : undefined}
            // When collapsed the label is visually hidden, so the icon-only
            // control needs its own accessible name.
            aria-label={collapsed ? label : undefined}
            title={collapsed ? label : undefined}
          >
            <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
            <span className="admin-nav__label">{label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop rail */}
      <aside className="admin-sidebar" data-collapsed={collapsed}>
        <div className="admin-sidebar__head">
          <Link href="/" className="admin-mark" title="Back to storefront">
            <span className="admin-mark__short" aria-hidden="true">
              PP
            </span>
            <span className="admin-mark__full">
              PURE PATH<sup>®</sup>
            </span>
          </Link>
        </div>

        {nav}

        <div className="admin-sidebar__foot">
          <button
            type="button"
            className="admin-collapse"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={15} aria-hidden="true" />
            <span className="admin-nav__label">Collapse</span>
          </button>
        </div>
      </aside>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="admin-sheet__backdrop"
              onClick={onCloseMobile}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.24, ease: EASE_OUT } }}
              exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_IN_OUT } }}
            />
            <motion.aside
              className="admin-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Admin sections"
              // Full transform strings — the x/y shorthands are not
              // hardware-accelerated.
              initial={{ transform: 'translateX(-100%)' }}
              animate={{
                transform: 'translateX(0%)',
                transition: { duration: 0.38, ease: [0.32, 0.72, 0, 1] },
              }}
              exit={{
                transform: 'translateX(-100%)',
                transition: { duration: 0.26, ease: EASE_IN_OUT },
              }}
            >
              <div className="admin-sheet__head">
                <span className="admin-mark__full">
                  PURE PATH<sup>®</sup>
                </span>
                <button
                  type="button"
                  className="admin-icon-button"
                  onClick={onCloseMobile}
                  aria-label="Close menu"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
