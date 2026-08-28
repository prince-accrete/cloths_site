import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getAdminProduct } from '@/lib/admin/store'
import { PageHeader } from '@/components/admin/page-header'
import { ProductForm } from '@/components/admin/product-form'

// Reads MongoDB per request — never prerendered at build time.
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const product = await getAdminProduct(id)
  return { title: product ? product.name : 'Product' }
}

export default async function AdminProductPage({ params }: Params) {
  const { id } = await params

  // `/admin/products/new` is reserved for the create flow, which needs a
  // storage provider before it can do anything honest.
  if (id === 'new') {
    return (
      <>
        <PageHeader eyebrow="Catalogue" title="New product" />
        <section className="admin-panel">
          <div className="admin-empty">
            Creating products needs a database and an image store. Neither is wired
            up yet — edit an existing product instead.
            <Link href="/admin/products" className="admin-link">
              Back to products
            </Link>
          </div>
        </section>
      </>
    )
  }

  const product = await getAdminProduct(id)
  if (!product) notFound()

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title={product.name}
        meta={
          <>
            Last updated{' '}
            {new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }).format(new Date(product.updatedAt))}
          </>
        }
        action={
          <>
            <Link href="/admin/products" className="admin-button">
              <ArrowLeft size={14} aria-hidden="true" /> Back
            </Link>
            <Link
              href={`/product/${product.id}`}
              className="admin-button"
              target="_blank"
              rel="noreferrer"
            >
              View <ExternalLink size={13} aria-hidden="true" />
            </Link>
          </>
        }
      />

      <ProductForm product={product} />
    </>
  )
}
