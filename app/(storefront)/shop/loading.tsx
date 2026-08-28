/**
 * /shop is a dynamic route (it reads searchParams), so without this the
 * browser sat on the previous page with no feedback while it resolved.
 *
 * The skeleton mirrors the real grid's geometry — same aspect-ratio, same
 * gutters — so nothing shifts when the content arrives.
 */
export default function ShopLoading() {
  return (
    <div className="shell" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading products…</span>

      <div className="page-head">
        <div className="section-head__title">
          <span className="eyebrow">Still Fits / T-shirts only</span>
          <h1 className="display display--md">Shop T-shirts.</h1>
        </div>
      </div>

      <div className="toolbar" aria-hidden="true">
        <div className="toolbar__group">
          <span className="meta">Fit</span>
          <span className="skeleton skeleton--chip" />
          <span className="skeleton skeleton--chip" />
          <span className="skeleton skeleton--chip" />
        </div>
        <span className="toolbar__count">—</span>
      </div>

      <div className="product-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <article className="product-card" key={i}>
            <div className="product-card__media skeleton" />
            <div className="product-card__meta">
              <div style={{ flex: 1 }}>
                <span className="skeleton skeleton--line" style={{ width: '62%' }} />
                <span
                  className="skeleton skeleton--line"
                  style={{ width: '44%', marginTop: '0.45rem' }}
                />
              </div>
              <span className="skeleton skeleton--line" style={{ width: '2.5rem' }} />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
