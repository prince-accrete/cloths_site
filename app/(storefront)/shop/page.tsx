import type { Metadata } from 'next'
import { Marquee } from '@/components/site/marquee'
import { Newsletter } from '@/components/site/newsletter'
import { ShopClient } from '@/components/site/shop-client'
import { listActiveProducts } from '@/lib/admin/store'
import { Lines, Reveal } from '@/components/site/reveal'

export const metadata: Metadata = {
  title: 'Shop T-shirts',
  description: 'Six essential silhouettes. Infinite ways to wear them.',
}

type Sort = 'featured' | 'low' | 'high' | 'new'

const SORTS: Sort[] = ['featured', 'low', 'high', 'new']

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; view?: string }>
}) {
  const [params, products] = await Promise.all([searchParams, listActiveProducts()])
  const wishlistOnly = params.view === 'wishlist'
  const sort = SORTS.includes(params.sort as Sort) ? (params.sort as Sort) : 'featured'

  return (
    <>
      <div className="shell">
        <div className="page-head">
          <div className="section-head__title">
            <Reveal as="span" className="eyebrow">
              {wishlistOnly ? 'Still Fits / Saved' : 'Still Fits / T-shirts only'}
            </Reveal>
            <h1 className="display display--md">
              <Lines
                lines={wishlistOnly ? ['Your list.'] : ['Shop T-shirts.']}
                enter
              />
            </h1>
          </div>
          <Reveal as="p" className="section-head__aside" index={1}>
            {wishlistOnly
              ? 'Everything you have saved, kept on this device.'
              : 'Six essential silhouettes. Infinite ways to wear them.'}
          </Reveal>
        </div>

        <ShopClient products={products} initialSort={sort} wishlistOnly={wishlistOnly} />
      </div>

      <div style={{ marginTop: 'var(--section-y)' }}>
        <Marquee />
      </div>
      <Newsletter />
    </>
  )
}
