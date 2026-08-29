import { StoreProvider } from '@/lib/store'
import { listActiveProducts } from '@/lib/admin/store'
import { Nav } from '@/components/site/nav'
import { Footer } from '@/components/site/footer'
import { CartDrawer } from '@/components/site/cart-drawer'
import { SearchOverlay } from '@/components/site/search-overlay'
import { SmoothScroll } from '@/components/site/smooth-scroll'

/**
 * Storefront chrome.
 *
 * A route group, so it adds no path segment — `/`, `/shop`, `/product/[id]`
 * and `/about` are unchanged. Its only job is to keep the nav, footer, cart,
 * smooth scroll and grid traces off /admin, which has its own shell.
 *
 * StoreProvider lives here rather than in the root layout so the cart context
 * and its localStorage effects never load on admin routes.
 */
export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  // One query per request, shared by the cart, search and wishlist. Reading the
  // catalogue here is what makes admin edits show up on the storefront.
  const products = await listActiveProducts()

  return (
    <StoreProvider products={products}>
      <SmoothScroll />

      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Film grain. One fixed layer for the whole document — see globals.css
          section 18 for why it is fixed rather than per-section. */}
      <div className="grain" aria-hidden="true" />

      {/* Exposed grid structure — 6 column traces behind everything. */}
      <div className="traces" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} />
        ))}
      </div>

      {/* Scroll progress spine — driven by a CSS scroll timeline, no JS. */}
      <div className="progress" aria-hidden="true">
        <div className="progress__bar" />
      </div>

      <Nav />
      <main id="main">{children}</main>
      <Footer />

      <CartDrawer />
      <SearchOverlay />
    </StoreProvider>
  )
}
