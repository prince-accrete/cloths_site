'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * UI/UX Pro Max motion preset #8, "Stagger List":
 *   trigger: load or scroll | duration 300-450ms | ease back.out(1.4)
 *   gsap.from('.grid-item', { opacity: 0, scale: 0.92, y: 16, stagger: 0.06 })
 *
 * Implemented with Framer Motion rather than pulling in GSAP.
 * back.out(1.4) is an overshoot ease; [0.34, 1.56, 0.64, 1] is its cubic
 * equivalent — the >1 control point is what produces the overshoot.
 *
 * Passing `replayKey` remounts the grid, so the stagger replays whenever the
 * filters or sort change. That doubles as feedback that the query applied.
 */

const EASE_BACK = [0.34, 1.56, 0.64, 1] as const // back.out(1.4) equivalent

// Full transform string, not the scale/y shorthands — see dialog-shell.tsx.
const ITEM: Variants = {
  hidden: { opacity: 0, transform: 'translateY(16px) scale(0.92)' },
  visible: {
    opacity: 1,
    transform: 'translateY(0px) scale(1)',
    transition: { duration: 0.4, ease: EASE_BACK },
  },
}

const ITEM_STILL: Variants = { hidden: { opacity: 1 }, visible: { opacity: 1 } }

export function StaggerGrid({
  children,
  replayKey,
  className = 'product-grid',
}: {
  children: ReactNode
  replayKey?: string | number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      key={replayKey}
      className={className}
      initial="hidden"
      animate="visible"
      // Only run once per mount when it is already on screen; below the fold
      // it waits until 15% of the grid is visible.
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  return <motion.div variants={reduce ? ITEM_STILL : ITEM}>{children}</motion.div>
}
