import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Cormorant_Garamond, IBM_Plex_Mono, Inter } from 'next/font/google'
import { StoreProvider } from '@/lib/store'
import { Nav } from '@/components/site/nav'
import { Footer } from '@/components/site/footer'
import { CartDrawer } from '@/components/site/cart-drawer'
import { SearchOverlay } from '@/components/site/search-overlay'
import { SmoothScroll } from '@/components/site/smooth-scroll'
import './globals.css'

/* The two faces the whole design rests on. The previous build named them in
   CSS but never loaded them, so everything fell back to Georgia and Arial. */

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  display: 'swap',
})

/* Editorial-tech: every utility label, counter and metadata cluster is mono.
   That contrast — expressive serif display against engineered mono labels —
   is what separates this from a lifestyle-first layout. */
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-plex-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://pure-path.example'),
  title: {
    default: 'Pure Path — Essential, Elevated',
    template: '%s — Pure Path',
  },
  description: 'Premium everyday T-shirts, designed with intention.',
  openGraph: {
    title: 'Pure Path — Essential, Elevated',
    description: 'Premium everyday T-shirts, designed with intention.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f4f1ea' }],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${mono.variable}`}>
      <body>
        <StoreProvider>
          <SmoothScroll />

          <a href="#main" className="skip-link">
            Skip to content
          </a>

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

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
