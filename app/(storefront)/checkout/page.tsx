import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { CheckoutForm } from '@/components/site/checkout-form'
import { Lines, Reveal } from '@/components/site/reveal'

export const metadata: Metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  // Signed-in buyers get their details prefilled; guests check out anonymously.
  // Requiring an account here is the single biggest cause of cart abandonment.
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <div className="shell">
      <div className="page-head">
        <div className="section-head__title">
          <Reveal as="span" className="eyebrow">
            Still Fits / Checkout
          </Reveal>
          <h1 className="display display--md">
            <Lines lines={['Checkout.']} enter />
          </h1>
        </div>
      </div>

      <CheckoutForm
        signedInEmail={session?.user?.email}
        signedInName={session?.user?.name ?? undefined}
      />
    </div>
  )
}
