import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Cormorant_Garamond, IBM_Plex_Mono, Inter } from 'next/font/google'
import './globals.css'

/**
 * Root layout — the document shell only.
 *
 * Storefront chrome (nav, footer, cart, smooth scroll, grid traces) lives in
 * app/(storefront)/layout.tsx so the /admin route group does not inherit it.
 * Only what is genuinely shared belongs here: html/body, the three fonts, the
 * design tokens in globals.css, and analytics.
 */

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

/* Utility labels, counters and metadata across both storefront and admin. */
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
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
