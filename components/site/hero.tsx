import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { Lines } from './reveal'

export function Hero() {
  return (
    <section className="hero shell">
      <div className="hero__media">
        <Image
          src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=2400&q=90"
          alt="A bone white t-shirt hung against a dark concrete wall"
          fill
          sizes="100vw"
          priority
          data-enter="media"
        />
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__copy">
        <span className="eyebrow eyebrow--light" data-enter="">
          Still Fits / Chapter 01
        </span>

        <h1 className="display display--lg hero__title">
          <Lines
            lines={['Essential.', <em key="e">Elevated.</em>]}
            enter
            start={1}
            words
            label="Essential. Elevated."
          />
        </h1>

        <p className="hero__lede" data-enter="" style={{ '--i': 3 } as React.CSSProperties}>
          Premium everyday T-shirts, designed with intention.
        </p>

        <div data-enter="" style={{ '--i': 4 } as React.CSSProperties}>
          <Link href="/shop" className="button button--light">
            Shop T-shirts <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <dl className="hero__spec" aria-label="Collection details">
        <div>
          <dt>Season</dt>
          <dd>Spring 26</dd>
        </div>
        <div>
          <dt>Styles</dt>
          <dd>06</dd>
        </div>
        <div>
          <dt>Sizes</dt>
          <dd>XS–XXL</dd>
        </div>
        <div>
          <dt>Made in</dt>
          <dd>India</dd>
        </div>
      </dl>

      <div className="hero__foot">
        <span className="hero__cue">
          Scroll to explore <ArrowDown size={13} />
        </span>
        <span className="hero__chapter">Six essentials · Spring 26</span>
        <span>01 / 04</span>
      </div>
    </section>
  )
}
