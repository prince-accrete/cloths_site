import type { ReactNode } from 'react'

/**
 * KPI tile. `delta` is intentionally text plus a sign, never colour alone —
 * a red/green pill with no glyph fails WCAG 1.4.1.
 */
export function StatCard({
  label,
  value,
  delta,
  hint,
  icon,
}: {
  label: string
  value: ReactNode
  delta?: { direction: 'up' | 'down' | 'flat'; text: string }
  hint?: string
  icon?: ReactNode
}) {
  return (
    <article className="admin-stat">
      <header>
        <span className="admin-eyebrow">{label}</span>
        {icon && <span className="admin-stat__icon">{icon}</span>}
      </header>

      <p className="admin-stat__value">{value}</p>

      <footer>
        {delta && (
          <span className="admin-stat__delta" data-direction={delta.direction}>
            {delta.direction === 'up' ? '▲' : delta.direction === 'down' ? '▼' : '—'}{' '}
            {delta.text}
          </span>
        )}
        {hint && <span className="admin-sub">{hint}</span>}
      </footer>
    </article>
  )
}
