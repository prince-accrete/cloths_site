import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="shell" style={{ paddingTop: 'clamp(9rem, 20vh, 14rem)' }}>
      <div className="empty">
        <span className="eyebrow">Error 404</span>
        <h1 className="display display--md">
          <em>Off the path.</em>
        </h1>
        <p className="lede" style={{ textAlign: 'center' }}>
          That page does not exist — or it did, and we retired it.
        </p>
        <Link href="/shop" className="button button--dark">
          Shop T-shirts <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  )
}
