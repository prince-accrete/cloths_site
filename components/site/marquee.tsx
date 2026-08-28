const ITEMS = [
  'Complimentary shipping over $150',
  '30-day returns, no questions',
  'Organic & recycled fibres',
  'Fair Wear audited factories',
  'Made for the long run',
]

/**
 * Infinite ticker. The track holds the list twice and translates by -50%, so
 * the loop point is invisible; the second copy is hidden from assistive tech.
 */
export function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <div className="marquee__group" key={copy} aria-hidden={copy === 1 || undefined}>
            {ITEMS.map((item) => (
              <span className="marquee__item" key={item}>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
