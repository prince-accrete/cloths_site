import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/admin-shell'
import './admin.css'

/**
 * Admin route group.
 *
 * `admin.css` is imported here rather than in `app/globals.css`, so the admin
 * stylesheet only ships on /admin routes and never weighs down the storefront.
 * The design tokens themselves still come from globals.css, which the root
 * layout loads for every route.
 *
 * This layout is a server component — see components/admin/admin-shell.tsx for
 * the single client boundary.
 */
export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s — Still Fits Admin',
  },
  description: 'Still Fits store administration.',
  // Nothing under /admin should ever be indexed.
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>
      <AdminShell>{children}</AdminShell>
    </>
  )
}
