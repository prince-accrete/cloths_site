'use client'

import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { useCallback, useEffect, useRef, type ReactNode } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Mirrors --ease-out / --ease-drawer in globals.css §02 (Emil Kowalski's
 *  `animate` skill). Never hand-roll a curve — take it from easing.dev. */
const EASE_OUT = [0.23, 1, 0.32, 1] as const
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const
const EASE_DRAWER = [0.32, 0.72, 0, 1] as const

export type DialogMotion = 'drawer' | 'sheet'

const VARIANTS: Record<DialogMotion, Variants> = {
  // Right-hand panel: slides in fast, leaves slightly faster.
  // Full transform strings, not the x/y/scale shorthands — the shorthands
  // are not hardware-accelerated and drop frames while the page is busy.
  drawer: {
    hidden: { transform: 'translateX(100%)' },
    visible: { transform: 'translateX(0%)', transition: { duration: 0.38, ease: EASE_DRAWER } },
    exit: { transform: 'translateX(100%)', transition: { duration: 0.26, ease: EASE_IN_OUT } },
  },
  // Full-surface search: settles down onto the page and lifts back off.
  sheet: {
    hidden: { opacity: 0, transform: 'translateY(-14px)' },
    visible: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.22, ease: EASE_OUT } },
    exit: { opacity: 0, transform: 'translateY(-10px)', transition: { duration: 0.18, ease: EASE_IN_OUT } },
  },
}

/**
 * Accessible modal wrapper: Escape to close, focus moved in on open and
 * restored on close, Tab cycled inside, background scroll locked, and the
 * whole thing announced as a dialog.
 *
 * AnimatePresence keeps the panel mounted through its exit transition — the
 * previous version returned null on close, so both overlays slid in but
 * vanished instantly.
 */
export function DialogShell({
  open,
  onClose,
  label,
  className,
  backdrop = true,
  variant = 'drawer',
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  className: string
  backdrop?: boolean
  variant?: DialogMotion
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const focusables = useCallback(() => {
    const node = panelRef.current
    if (!node) return [] as HTMLElement[]
    return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
    )
  }, [])

  useEffect(() => {
    if (!open) return

    const restoreTo = document.activeElement as HTMLElement | null
    document.body.dataset.locked = 'true'

    // Defer so the panel has painted before we hunt for something to focus.
    const raf = requestAnimationFrame(() => {
      const [first] = focusables()
      ;(first ?? panelRef.current)?.focus()
    })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const items = focusables()
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      delete document.body.dataset.locked
      restoreTo?.focus?.()
    }
  }, [open, onClose, focusables])

  // Honour the OS setting: cross-fade only, no travel.
  const variants: Variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.01 } },
        exit: { opacity: 0, transition: { duration: 0.01 } },
      }
    : VARIANTS[variant]

  return (
    <AnimatePresence>
      {open && (
        <>
          {backdrop && (
            <motion.div
              key="backdrop"
              className="backdrop"
              onClick={onClose}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.24, ease: EASE_OUT } }}
              exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_IN_OUT } }}
            />
          )}
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={className}
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
