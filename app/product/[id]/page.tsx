import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { getProduct, products } from '@/lib/products'
import { BuyPanel } from '@/components/site/buy-panel'
import { ProductCard } from '@/components/site/product-card'
import { Newsletter } from '@/components/site/newsletter'
import { Reveal } from '@/components/site/reveal'

type Params = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const product = getProduct(id)
  if (!product) return { title: 'Not found' }
  return {
    title: product.name,
    description: product.tagline,
    openGraph: {
      title: `${product.name} — Pure Path`,
      description: product.tagline,
      images: [product.images[0].src],
    },
  }
}

export default async function ProductPage({ params }: Params) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()

  const related = products.filter((p) => p.id !== product.id).slice(0, 4)

  return (
    <>
      <div className="shell pdp">
        <div className="pdp__gallery">
          {product.images.map((image, i) => (
            <figure className="pdp__figure" key={image.src} data-reveal={i > 0 ? 'media' : undefined}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 860px) 100vw, 55vw"
                priority={i === 0}
              />
            </figure>
          ))}
        </div>

        <div className="pdp__panel">
          <Link href="/shop" className="text-link" style={{ alignSelf: 'start' }}>
            <ArrowLeft size={14} /> All T-shirts
          </Link>

          <div>
            <span className="eyebrow">{product.fit}</span>
            <h1 className="pdp__title" style={{ marginTop: '0.6rem' }}>
              {product.name}
            </h1>
          </div>

          <p className="lede">{product.tagline}</p>

          <div className="pdp__price">
            <strong>${product.price}</strong>
            <span className="meta">Duties included</span>
          </div>

          <div className="pdp__spec">
            <span>
              <span className="swatch" style={{ background: product.swatch }} aria-hidden="true" />
              {product.color}
            </span>
            <span>{product.weight}</span>
            <span>{product.fabric}</span>
          </div>

          <BuyPanel product={product} />

          <div>
            <details className="accordion" open>
              <summary>
                Description <Plus size={14} />
              </summary>
              <div className="accordion__body">
                <p>{product.description}</p>
              </div>
            </details>

            <details className="accordion">
              <summary>
                Fabric & construction <Plus size={14} />
              </summary>
              <div className="accordion__body">
                <ul>
                  {product.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </details>

            <details className="accordion">
              <summary>
                Shipping & returns <Plus size={14} />
              </summary>
              <div className="accordion__body">
                <p>
                  Complimentary shipping on orders over $150. Returns accepted within 30 days,
                  unworn and with tags attached.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      <section className="section shell">
        <div className="section-head">
          <div className="section-head__title">
            <Reveal as="span" className="eyebrow">
              Pairs well with
            </Reveal>
            <h2 className="display display--sm">
              <em>More essentials.</em>
            </h2>
          </div>
        </div>

        <div className="product-grid">
          {related.map((item, i) => (
            <ProductCard key={item.id} product={item} index={i} />
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  )
}
