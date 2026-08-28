import type { CSSProperties, ElementType, ReactNode } from 'react'

type RevealVariant = 'media' | 'line' | 'mask' | 'rise'

/**
 * Marks an element for the scroll-driven reveal defined in globals.css §06.
 *
 * There is no JavaScript behind this — no IntersectionObserver, no state. The
 * animation runs on a CSS `view()` timeline off the main thread, and in a
 * browser without scroll-driven animations the element simply renders visible.
 */
export function Reveal({
  as: Tag = 'div',
  variant,
  index = 0,
  className,
  style,
  children,
}: {
  as?: ElementType
  variant?: RevealVariant
  /** Staggers this element against its siblings. */
  index?: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  return (
    <Tag
      data-reveal={variant ?? ''}
      className={className}
      style={{ '--i': index, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  )
}

/**
 * Splits a heading into masked lines that rise out of one another.
 *
 * `enter` uses a time-based animation for above-the-fold headings, which a
 * scroll timeline cannot animate because they are already in view on load.
 */
export function Lines({
  lines,
  enter = false,
  start = 0,
}: {
  lines: ReactNode[]
  enter?: boolean
  start?: number
}) {
  const attr = enter ? 'data-enter' : 'data-reveal'
  return (
    <>
      {lines.map((line, i) => (
        <span className="line" key={i}>
          <span {...{ [attr]: 'rise' }} style={{ '--i': start + i } as CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </>
  )
}
