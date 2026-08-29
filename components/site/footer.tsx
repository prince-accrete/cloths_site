import Link from 'next/link'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All T-shirts', href: '/shop' },
      { label: 'New arrivals', href: '/shop?sort=new' },
      { label: 'Best sellers', href: '/shop?sort=featured' },
      { label: 'Wishlist', href: '/shop?view=wishlist' },
      { label: 'Your account', href: '/account' },
    ],
  },
  {
    title: 'Customer care',
    links: [
      { label: 'Contact', href: '/help/contact' },
      { label: 'Shipping & returns', href: '/help/shipping' },
      { label: 'Size guide', href: '/help/size-guide' },
      { label: 'Fabric care', href: '/help/fabric-care' },
    ],
  },
  {
    title: 'Follow along',
    links: [
      { label: 'Instagram', href: '/about' },
      { label: 'Pinterest', href: '/about' },
      { label: 'TikTok', href: '/about' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="footer shell">
      <div className="footer__top">
        <div className="footer__brand">
          <Link href="/" className="wordmark">
            STILL FITS<sup>®</sup>
          </Link>
          <p>Everyday, considered. Made in limited runs, restocked slowly.</p>
        </div>

        <nav className="footer__cols" aria-label="Footer">
          {COLUMNS.map((col) => (
            <div className="footer__col" key={col.title}>
              <span>{col.title}</span>
              {col.links.map((link) => (
                <Link key={link.label} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} Still Fits</span>
        <span>Made for the long run</span>
      </div>
    </footer>
  )
}
