'use client'

import { useCallback, useState, type ReactNode } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AdminHeader } from './admin-header'

/**
 * Thin client boundary that owns the one piece of state the sidebar and header
 * share (the mobile sheet). Keeping it here lets `app/admin/layout.tsx` stay a
 * server component, so page content is still streamed from the server.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <div className="admin">
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={closeMobile} />
      <div className="admin__main">
        <AdminHeader onOpenMenu={() => setMobileOpen(true)} />
        <main className="admin__content" id="admin-main">
          {children}
        </main>
      </div>
    </div>
  )
}
