import type { ReactNode } from 'react'

export type Column<T> = {
  /** Stable key, also used for the cell's `data-label` on the mobile stack. */
  key: string
  header: ReactNode
  /** Cell renderer. Kept as a function so cells can be server-rendered. */
  cell: (row: T) => ReactNode
  align?: 'start' | 'end'
  /** Numeric columns get tabular figures so digits stay in column. */
  numeric?: boolean
  /** Hidden below 860px, where the table restacks into cards. */
  secondary?: boolean
  width?: string
}

/**
 * Reusable admin data table.
 *
 * A real `<table>` — not a grid of divs — so screen readers announce row and
 * column relationships and the browser handles column sizing. Below 860px each
 * row restacks into a labelled card using the `data-label` on every cell.
 *
 * Server component: cells render on the server unless a caller passes a client
 * component into `cell`.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  empty = 'Nothing here yet.',
  onRowHref,
}: {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  /** Announced to screen readers; visually hidden. */
  caption: string
  empty?: ReactNode
  /** When set, the first cell becomes a link to this href. */
  onRowHref?: (row: T) => string
}) {
  if (rows.length === 0) {
    return <div className="admin-empty">{empty}</div>
  }

  return (
    <div className="admin-table__scroll">
      <table className="admin-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                data-align={col.align ?? 'start'}
                data-secondary={col.secondary || undefined}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} data-href={onRowHref?.(row)}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  data-label={typeof col.header === 'string' ? col.header : col.key}
                  data-align={col.align ?? 'start'}
                  data-numeric={col.numeric || undefined}
                  data-secondary={col.secondary || undefined}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Status pill. `tone` maps to a colour in admin.css — never colour alone. */
export function StatusPill({
  tone,
  children,
}: {
  tone: 'neutral' | 'positive' | 'warning' | 'muted'
  children: ReactNode
}) {
  return (
    <span className="admin-pill" data-tone={tone}>
      {children}
    </span>
  )
}
