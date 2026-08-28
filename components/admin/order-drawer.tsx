'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, orderTotal, type Order } from '@/lib/admin/types'
import { setOrderStatusAction } from '@/lib/admin/actions'
import { StatusPill } from './data-table'

const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const
const EASE_DRAWER = [0.32, 0.72, 0, 1] as const

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Order detail drawer.
 *
 * Same contract as the storefront's <DialogShell>: role="dialog" + aria-modal,
 * Escape to close, a Tab focus trap, background scroll lock, and focus restored
 * to the trigger on close.
 *
 * Which order is open lives in the URL (`?order=SF-2431`) rather than in state,
 * so a drawer is linkable, survives refresh, and the browser back button closes
 * it — the dashboard's activity feed links straight into it.
 */
export function OrderDrawer({
  orders,
  productLookup,
}: {
  orders: Order[]
  productLookup: Record<string, { name: string; image: string; href: string }>
}) {
  const router = useRouter()
  const params = useSearchParams()
  const openId = params.get('order')
  const order = orders.find((o) => o.id === openId) ?? null
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    const next = new URLSearchParams(params.toString())
    next.delete('order')
    router.push(next.size ? `/admin/orders?${next}` : '/admin/orders', { scroll: false })
  }, [params, router])

  useEffect(() => {
    if (!order) return
    const restoreTo = document.activeElement as HTMLElement | null
    document.body.dataset.locked = 'true'

    const raf = requestAnimationFrame(() => {
      const node = panelRef.current
      const first = node?.querySelectorAll<HTMLElement>(FOCUSABLE)[0]
      ;(first ?? node)?.focus()
    })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab') return
      const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || !panelRef.current?.contains(document.activeElement))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      delete document.body.dataset.locked
      restoreTo?.focus?.()
    }
  }, [order, close])

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            className="admin-sheet__backdrop"
            onClick={close}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.24 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          />
          <motion.div
            ref={panelRef}
            className="admin-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Order ${order.id}`}
            tabIndex={-1}
            initial={{ transform: 'translateX(100%)' }}
            animate={{ transform: 'translateX(0%)', transition: { duration: 0.38, ease: EASE_DRAWER } }}
            exit={{ transform: 'translateX(100%)', transition: { duration: 0.26, ease: EASE_IN_OUT } }}
          >
            <header className="admin-drawer__head">
              <div>
                <span className="admin-eyebrow">Order</span>
                <h2 className="admin-drawer__id">{order.id}</h2>
                <p className="admin-sub">
                  {order.customer.name} · {order.customer.email}
                </p>
              </div>
              <button type="button" className="admin-icon-button" onClick={close} aria-label="Close order">
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div className="admin-drawer__body">
              <ul className="admin-lines" role="list">
                {order.lines.map((line) => {
                  const product = productLookup[line.productId]
                  return (
                    <li className="admin-line" key={`${line.productId}-${line.size}`}>
                      <span className="admin-thumb">
                        {product && <Image src={product.image} alt="" fill sizes="56px" aria-hidden="true" />}
                      </span>
                      <div>
                        <Link href={product?.href ?? '#'} className="admin-link">
                          {product?.name ?? line.productId}
                        </Link>
                        <span className="admin-sub">
                          Size {line.size} · Qty {line.qty}
                        </span>
                      </div>
                      <span className="admin-line__price">${line.unitPrice * line.qty}</span>
                    </li>
                  )
                })}
              </ul>

              <div className="admin-drawer__total">
                <span className="admin-eyebrow">Total</span>
                <strong>${orderTotal(order)}</strong>
              </div>
            </div>

            <footer className="admin-drawer__foot">
              <span className="admin-eyebrow">Status</span>
              <StatusPill tone={ORDER_STATUS_TONE[order.status]}>
                {ORDER_STATUS_LABEL[order.status]}
              </StatusPill>

              <form action={setOrderStatusAction} className="admin-drawer__actions">
                <input type="hidden" name="id" value={order.id} />
                {order.status !== 'fulfilled' && (
                  <button
                    type="submit"
                    name="status"
                    value="fulfilled"
                    className="admin-button admin-button--primary"
                  >
                    Mark fulfilled
                  </button>
                )}
                {order.status === 'pending' && (
                  <button type="submit" name="status" value="cancelled" className="admin-button">
                    Cancel
                  </button>
                )}
              </form>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
