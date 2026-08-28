'use client'

import { useCallback, useEffect, useRef, type ReactNode } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Accessible modal wrapper: Escape to close, focus moved in on open and
 * restored on close, Tab cycled inside, background scroll locked, and the
 * whole thing announced as a dialog.
 *
 * The old build had none of this — the drawer and search overlay were plain
 * divs you could tab straight out of.
 */
export function DialogShell({
  open,
  onClose,
  label,
  className,
  backdrop = true,
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  className: string
  backdrop?: boolean
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)

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

  if (!open) return null

  return (
    <>
      {backdrop && <div className="backdrop" onClick={onClose} aria-hidden="true" />}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={className}
      >
        {children}
      </div>
    </>
  )
}
