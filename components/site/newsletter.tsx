'use client'

import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Lines, Reveal } from './reveal'

export function Newsletter() {
  const [done, setDone] = useState(false)

  return (
    <section className="section section--tight shell newsletter">
      <Reveal as="span" className="eyebrow">
        Stay in the know
      </Reveal>

      <h2 className="display display--sm">
        <Lines lines={['Join the world', <em key="e">of Pure Path.</em>]} />
      </h2>

      {done ? (
        <p className="newsletter__ok" role="status">
          <Check size={17} /> You’re on the list.
        </p>
      ) : (
        <form
          className="newsletter__form"
          onSubmit={(e) => {
            e.preventDefault()
            setDone(true)
          }}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="Your email address"
          />
          <button type="submit" className="button button--dark">
            Subscribe <ArrowRight size={15} />
          </button>
        </form>
      )}

      <p className="meta" style={{ maxWidth: '34ch' }}>
        One letter a month. New arrivals, restocks, and nothing else.
      </p>
    </section>
  )
}
