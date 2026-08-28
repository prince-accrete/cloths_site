'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Lines, Reveal } from './reveal'

/**
 * The one piece of pointer-driven motion on the site. Coordinates are written
 * straight to CSS custom properties, so the badge is positioned by the
 * compositor rather than by a React re-render on every mousemove.
 *
 * Hidden entirely on coarse pointers (globals.css §15).
 */
export function Lookbook() {
  const ref = useRef<HTMLElement>(null)
  const [hover, setHover] = useState(false)

  return (
    <section
      ref={ref}
      className="lookbook shell"
      data-hover={hover}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const box = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--x', `${e.clientX - box.left}px`)
        e.currentTarget.style.setProperty('--y', `${e.clientY - box.top}px`)
      }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div className="lookbook__media">
        <Image
          src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=2000&q=88"
          alt="Editorial lookbook image of neutral-toned clothing on a rail"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <span className="lookbook__cursor" aria-hidden="true">
        View
      </span>

      <div className="lookbook__copy">
        <Reveal as="span" className="eyebrow eyebrow--light">
          A study in simplicity
        </Reveal>
        <h2 className="display display--md" style={{ margin: '1.4rem 0 1.6rem' }}>
          <Lines lines={['Less, but', <em key="e">better.</em>]} />
        </h2>
        <Reveal index={2}>
          <p className="lede" style={{ color: 'rgba(251,250,247,.85)', marginBottom: '1.8rem' }}>
            See the collection in its natural habitat.
          </p>
          <Link href="/shop" className="text-link" style={{ color: 'var(--white)' }}>
            Explore the lookbook <ArrowRight size={14} />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
