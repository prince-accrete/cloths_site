'use client'

import { useActionState } from 'react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { subscribeAction } from '@/lib/shop/actions'
import { Lines, Reveal } from './reveal'

export function Newsletter() {
  const [state, formAction, pending] = useActionState(subscribeAction, { ok: false, message: '' })

  return (
    <section className="section section--tight shell newsletter">
      <Reveal as="span" className="eyebrow">
        Stay in the know
      </Reveal>

      <h2 className="display display--sm">
        <Lines lines={['Join the world', <em key="e">of Still Fits.</em>]} />
      </h2>

      {state.ok ? (
        <p className="newsletter__ok" role="status">
          <Check size={17} /> {state.message}
        </p>
      ) : (
        <form className="newsletter__form" action={formAction}>
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
          <button type="submit" className="button button--dark" disabled={pending}>
            {pending ? 'Joining…' : 'Subscribe'}
            {pending ? <Loader2 size={15} className="admin-spin" /> : <ArrowRight size={15} />}
          </button>
        </form>
      )}

      <p className="meta" style={{ maxWidth: '34ch' }}>
        One letter a month. New arrivals, restocks, and nothing else.
      </p>
    </section>
  )
}
