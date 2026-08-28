import type { ReactNode } from 'react'

/**
 * Standard page head for admin routes: mono eyebrow, serif display title,
 * mono meta line, and an optional right-aligned action.
 */
export function PageHeader({
  eyebrow,
  title,
  meta,
  action,
}: {
  eyebrow: string
  title: string
  meta?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="admin-pagehead">
      <div>
        <span className="admin-eyebrow">{eyebrow}</span>
        <h1 className="admin-title">{title}</h1>
        {meta && <p className="admin-pagehead__meta">{meta}</p>}
      </div>
      {action && <div className="admin-pagehead__action">{action}</div>}
    </div>
  )
}
