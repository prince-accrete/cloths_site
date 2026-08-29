/**
 * Bare layout for the login page.
 *
 * A nested layout replaces the parent's UI for this segment, so /admin/login
 * gets the admin stylesheet (inherited from app/admin/layout.tsx) without the
 * sidebar, header or breadcrumbs.
 */
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-auth">{children}</div>
}
