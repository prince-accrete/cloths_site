import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { listActiveProducts } from '@/lib/admin/store'
import { Hero } from '@/components/site/hero'
import { Marquee } from '@/components/site/marquee'
import { Lookbook } from '@/components/site/lookbook'
import { Newsletter } from '@/components/site/newsletter'
import { ProductCard } from '@/components/site/product-card'
import { Lines, Reveal } from '@/components/site/reveal'
import { StaggerGrid, StaggerItem } from '@/components/site/stagger-grid'

// Prerendered for speed, but rebuilt within a minute of a catalogue change
// (and immediately when an admin save calls revalidatePath).
export const revalidate = 60

const FITS = [
  {
    title: 'Regular fit',
    copy: 'The one you reach for, every time.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000&q=85',
    alt: 'Regular fit t-shirt worn by a model',
  },
  {
    title: 'Oversized',
    copy: 'More room. More presence.',
    image: 'https://images.unsplash.com/photo-1599255068390-206e0d068539?w=1000&q=85',
    alt: 'Oversized t-shirt shown from the back',
  },
  {
    title: 'Relaxed fit',
    copy: 'Easy through the body, refined at the edge.',
    image: 'https://images.unsplash.com/photo-1654432008965-be24166fb425?w=1000&q=85',
    alt: 'Relaxed fit t-shirt in a studio setting',
  },
]

const LEDGER = [
  { term: 'Quality', detail: 'Long-staple fibre only' },
  { term: 'Fabric', detail: 'Milled in India' },
  { term: 'Fit', detail: 'Four rounds of sampling' },
  { term: 'Craft', detail: 'Fair Wear audited' },
]

export default async function HomePage() {
  const products = await listActiveProducts()

  return (
    <>
      <Hero />
      <Marquee />

      {/* 01 — Collection */}
      <section className="section shell collection">
        <div className="pin">
          <Reveal as="span" className="eyebrow">
            01 — The collection
          </Reveal>
          <h2 className="display display--sm" style={{ margin: '1.2rem 0 1.4rem' }}>
            <Lines lines={['The essential', <em key="e">collection.</em>]} />
          </h2>
          <Reveal index={2}>
            <p className="lede" style={{ marginBottom: '1.75rem' }}>
              Quietly confident staples, made from considered fabrics and cut for the way you
              actually live.
            </p>
            <Link href="/shop" className="text-link">
              View all T-shirts <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>

        <div className="collection__grid">
          {products.slice(0, 4).map((product, i) => (
            <Link href={`/product/${product.id}`} className="tile" key={product.id}>
              <div className="tile__media" data-reveal="media" style={{ '--i': i % 2 } as React.CSSProperties}>
                <Image
                  src={product.images[0].src}
                  alt={product.images[0].alt}
                  fill
                  sizes="(max-width: 860px) 50vw, 32vw"
                />
              </div>
              <div className="tile__label">
                <span className="index" style={{ color: 'inherit' }}>
                  0{i + 1}
                </span>
                <h3>{product.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial — the page's dark anchor, between two light sections. */}
      <section className="editorial on-ink">
        <div className="editorial__media">
          <Image
            src="https://images.unsplash.com/photo-1666358084687-14347fbf364c?w=1600&q=88"
            alt="Close-up of the oat Pima tee, showing the fabric surface"
            fill
            sizes="(max-width: 860px) 100vw, 55vw"
          />
        </div>

        <div className="editorial__copy">
          <Reveal as="span" className="eyebrow">
            The Still Fits standard
          </Reveal>
          <h2 className="display display--sm">
            <Lines lines={['Made for', <em key="e">every day.</em>]} />
          </h2>
          <Reveal index={2}>
            <p className="lede">
              Premium materials, considered fits and timeless design. Nothing extra. Everything
              intentional.
            </p>
          </Reveal>

          <Reveal index={3} className="editorial__stats">
            <div className="editorial__stat">
              <strong>XS–XXL</strong>
              <span className="eyebrow">Every size</span>
            </div>
            <div className="editorial__stat">
              <strong>04</strong>
              <span className="eyebrow">Sampling rounds</span>
            </div>
            <div className="editorial__stat">
              <strong>06</strong>
              <span className="eyebrow">Styles, no more</span>
            </div>
          </Reveal>

          <Reveal index={4}>
            <Link href="/shop" className="button button--dark">
              Discover the collection <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 02 — Fits */}
      <section className="section shell">
        <div className="section-head">
          <div className="section-head__title">
            <Reveal as="span" className="eyebrow">
              02 — Find your shape
            </Reveal>
            <h2 className="display display--sm">
              <Lines lines={[<>Shop by <em key="e">fit.</em></>]} />
            </h2>
          </div>
          <Reveal as="p" className="section-head__aside" index={1}>
            Every body has a point of view. Find the silhouette that feels like yours.
          </Reveal>
        </div>

        <div className="fits">
          {FITS.map((fit, i) => (
            <Link href="/shop" className="fit" key={fit.title}>
              <div className="fit__media" data-reveal="media" style={{ '--i': i } as React.CSSProperties}>
                <Image
                  src={fit.image}
                  alt={fit.alt}
                  fill
                  sizes="(max-width: 860px) 50vw, 32vw"
                />
              </div>
              <div className="fit__body">
                <h3>{fit.title}</h3>
                <p>{fit.copy}</p>
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 03 — Best sellers */}
      <section className="section section--tight section--raised shell">
        <div className="section-head">
          <div className="section-head__title">
            <Reveal as="span" className="eyebrow">
              03 — Most loved
            </Reveal>
            <h2 className="display display--sm">
              <Lines lines={[<>Best <em key="e">sellers.</em></>]} />
            </h2>
          </div>
          <Reveal className="section-head__aside" index={1}>
            <Link href="/shop" className="text-link">
              All six pieces <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>

        <StaggerGrid>
          {products.slice(0, 4).map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

      <Lookbook />

      {/* 04 — Story */}
      <section className="story shell" id="story">
        <Reveal as="span" className="eyebrow eyebrow--dim">
          04 — Our point of view
        </Reveal>

        <div className="story__body">
          <h2 className="display display--md" style={{ margin: '1.5rem 0 0' }}>
            <Lines lines={['Designed with', <em key="e">intention.</em>]} />
          </h2>
          <Reveal as="p" className="story__lede" index={2}>
            We believe the everyday deserves more attention. That means better cotton, smarter
            fits, and clothes that stay in your rotation for years — not seasons.
          </Reveal>
        </div>

        <dl className="story__ledger">
          {LEDGER.map((item, i) => (
            <div key={item.term} style={{ '--i': i } as React.CSSProperties}>
              <dt>
                0{i + 1} / {item.term}
              </dt>
              <dd>{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Newsletter />
    </>
  )
}
