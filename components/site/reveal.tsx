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
 * Splits a heading into masked lines that rise out of one another, and
 * optionally into words within each line for a finer stagger.
 *
 * `enter` uses a time-based animation for above-the-fold headings, which a
 * scroll timeline cannot animate because they are already in view on load.
 *
 * Accessibility: when `words` is set, the split markup is hidden from
 * assistive technology and an unsplit copy carries the accessible name, so a
 * screen reader hears one sentence rather than a stream of fragments. Both
 * copies are server-rendered, so the heading is complete without JavaScript.
 */
export function Lines({
  lines,
  enter = false,
  start = 0,
  words = false,
  label,
}: {
  lines: ReactNode[]
  enter?: boolean
  start?: number
  /** Stagger word by word instead of line by line. Requires `label`. */
  words?: boolean
  /** The unsplit sentence, used as the accessible name when `words` is set. */
  label?: string
}) {
  const attr = enter ? 'data-enter' : 'data-reveal'

  if (words) {
    let n = start
    return (
      <>
        {label && <span className="sr-only">{label}</span>}
        <span aria-hidden="true">
          {lines.map((line, i) => (
            <span className="line" key={i}>
              {splitWords(line).map((word, j) => (
                <span
                  className="word"
                  key={j}
                  {...{ [attr]: 'rise' }}
                  style={{ '--i': n++ } as CSSProperties}
                >
                  {word}
                </span>
              ))}
            </span>
          ))}
        </span>
      </>
    )
  }

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

/**
 * Splits a line into word nodes. Plain strings split on whitespace; a React
 * element (an <em>, say) is kept whole rather than torn apart — the skill's
 * rule is never to split meaningful inline markup.
 */
function splitWords(line: ReactNode): ReactNode[] {
  if (typeof line === 'string') {
    return line.split(/(\s+)/).filter((t) => t.trim().length > 0)
  }
  return [line]
}
