import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Marquee } from '@/components/site/marquee'
import { Newsletter } from '@/components/site/newsletter'
import { Lines, Reveal } from '@/components/site/reveal'

export const metadata: Metadata = {
  title: 'About',
  description: 'Why Still Fits makes six T-shirts and nothing else.',
}

const PRINCIPLES = [
  {
    term: 'Fewer, better',
    detail:
      'Six styles is the whole line. Every addition has to displace something, which keeps the standard high and the wardrobe simple.',
  },
  {
    term: 'Fibre first',
    detail:
      'Long-staple cotton, milled in India. Short fibres pill and thin; long ones soften and stay. It costs more and it lasts longer.',
  },
  {
    term: 'Fit as a discipline',
    detail:
      'Four rounds of sampling per style, fitted on real bodies across the full size range — not graded up from a single sample size.',
  },
  {
    term: 'Slow restocks',
    detail:
      'We remake what works instead of chasing a new drop each month. If something sells out, it comes back the same as it was.',
  },
]

export default function AboutPage() {
  return (
    <>
      <div className="shell">
        <div className="page-head">
          <div className="section-head__title">
            <Reveal as="span" className="eyebrow">
              Still Fits / Our point of view
            </Reveal>
            <h1 className="display display--md">
              <Lines lines={['Six T-shirts.', <em key="e">Nothing else.</em>]} enter />
            </h1>
          </div>
          <Reveal as="p" className="section-head__aside" index={1}>
            A small line, made properly, restocked slowly.
          </Reveal>
        </div>
      </div>

      <section className="editorial">
        <div className="editorial__media">
          <Image
            src="https://images.unsplash.com/photo-1666358084687-14347fbf364c?w=1600&q=88"
            alt="Detail of the oat Pima cotton jersey"
            fill
            sizes="(max-width: 860px) 100vw, 55vw"
          />
        </div>
        <div className="editorial__copy">
          <Reveal as="span" className="eyebrow">
            The standard
          </Reveal>
          <h2 className="display display--sm">
            <Lines lines={['Better cotton,', <em key="e">longer life.</em>]} />
          </h2>
          <Reveal index={2}>
            <p className="lede">
              A T-shirt is the most-worn thing most people own and the least-considered thing most
              brands make. We went the other way: fewer styles, better fibre, and a fit process that
              takes months rather than weeks.
            </p>
          </Reveal>
          <Reveal index={3}>
            <Link href="/shop" className="button button--dark">
              Shop the collection <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section shell">
        <div className="section-head">
          <div className="section-head__title">
            <Reveal as="span" className="eyebrow">
              How we work
            </Reveal>
            <h2 className="display display--sm">
              <Lines lines={[<>Four <em key="e">principles.</em></>]} />
            </h2>
          </div>
        </div>

        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
            gap: 'clamp(1.75rem, 3vw, 3rem)',
            margin: 0,
          }}
        >
          {PRINCIPLES.map((item, i) => (
            <Reveal key={item.term} index={i} style={{ display: 'grid', gap: '0.7rem' }}>
              <span className="index">0{i + 1}</span>
              <hr className="rule" />
              <dt style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 300 }}>
                {item.term}
              </dt>
              <dd style={{ margin: 0, color: 'var(--muted)' }}>{item.detail}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      <Marquee />
      <Newsletter />
    </>
  )
}
