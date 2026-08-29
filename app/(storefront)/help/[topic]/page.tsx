import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Lines, Reveal } from '@/components/site/reveal'

/**
 * Customer-care content, one route for all of it.
 *
 * These were dead links pointing at /about. Real pages with real content beat
 * a nav item that goes nowhere — and the size guide in particular is the page
 * that prevents returns.
 */

type Topic = {
  eyebrow: string
  title: string
  intro: string
  table?: { head: string[]; rows: string[][] }
  sections?: { heading: string; body: string[] }[]
}

const TOPICS: Record<string, Topic> = {
  'size-guide': {
    eyebrow: 'Customer care',
    title: 'Size guide.',
    intro:
      'Measurements are of the garment laid flat, in inches. Measure a t-shirt you already like and match it — that is more reliable than measuring yourself.',
    table: {
      head: ['Size', 'Chest (flat)', 'Length', 'Shoulder', 'Fits chest'],
      rows: [
        ['XS', '18.5"', '26"', '16.5"', '34–36"'],
        ['S', '19.5"', '27"', '17.5"', '36–38"'],
        ['M', '20.5"', '28"', '18.5"', '38–40"'],
        ['L', '22"', '29"', '19.5"', '40–42"'],
        ['XL', '23.5"', '30"', '20.5"', '42–44"'],
        ['XXL', '25"', '31"', '21.5"', '44–46"'],
      ],
    },
    sections: [
      {
        heading: 'Between two sizes?',
        body: [
          'Regular Fit runs true — take your usual size.',
          'Relaxed Fit already has room through the body; size down if you want it closer.',
          'Oversized is cut two sizes wide by design. Take your normal size unless you want it enormous.',
        ],
      },
      {
        heading: 'After washing',
        body: [
          'Everything is pre-shrunk and garment-washed, so expect no more than about half an inch of movement in length over the first few washes.',
        ],
      },
    ],
  },

  shipping: {
    eyebrow: 'Customer care',
    title: 'Shipping & returns.',
    intro: 'We ship across India. Cash on delivery is available everywhere we deliver.',
    sections: [
      {
        heading: 'Delivery',
        body: [
          'Free delivery on orders over ₹1,500. Below that, delivery is ₹99.',
          'Metro cities: 2–4 working days. Elsewhere: 4–7 working days.',
          'You will get a tracking link by email once your order is dispatched.',
        ],
      },
      {
        heading: 'Cash on delivery',
        body: [
          'Pay the courier in cash when your order arrives. Please keep the exact amount ready.',
          'Card, UPI and netbanking are coming soon.',
        ],
      },
      {
        heading: 'Returns',
        body: [
          'Thirty days from delivery, unworn and with tags attached.',
          'Email us and we will arrange a pickup. Refunds are issued within 7 working days of the item reaching us.',
          'Anything that arrives faulty is our cost, always.',
        ],
      },
    ],
  },

  contact: {
    eyebrow: 'Customer care',
    title: 'Contact.',
    intro: 'A small team, so you will get a person rather than a ticket number.',
    sections: [
      {
        heading: 'Email',
        body: ['hello@still-fits.example — we reply within one working day.'],
      },
      {
        heading: 'Order questions',
        body: [
          'Include your order number (it looks like SF-2431) and we can answer immediately.',
          'You can also see any order at still-fits.example/order/your-order-number.',
        ],
      },
      { heading: 'Hours', body: ['Monday to Friday, 10am to 6pm IST.'] },
    ],
  },

  'fabric-care': {
    eyebrow: 'Customer care',
    title: 'Fabric care.',
    intro: 'None of this is fussy. Do these things and a shirt lasts years instead of one season.',
    sections: [
      {
        heading: 'Washing',
        body: [
          'Cold wash, inside out, with similar colours.',
          'Skip the fabric softener — it coats the fibres and makes cotton less absorbent over time.',
        ],
      },
      {
        heading: 'Drying',
        body: [
          'Line dry in shade. Tumble drying is the single fastest way to shrink a t-shirt and break down the collar.',
          'Reshape the shoulders while damp.',
        ],
      },
      {
        heading: 'The pigment-dyed pieces',
        body: [
          'The Studio Tee is pigment dyed and will fade, unevenly and slowly. That is the intent, not a fault. Wash it cold and separately for the first few washes.',
        ],
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(TOPICS).map((topic) => ({ topic }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>
}): Promise<Metadata> {
  const { topic } = await params
  const t = TOPICS[topic]
  return { title: t ? t.title.replace(/\.$/, '') : 'Not found' }
}

export default async function HelpPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  const t = TOPICS[topic]
  if (!t) notFound()

  return (
    <div className="shell">
      <div className="page-head">
        <div className="section-head__title">
          <Reveal as="span" className="eyebrow">
            {t.eyebrow}
          </Reveal>
          <h1 className="display display--md">
            <Lines lines={[t.title]} enter />
          </h1>
        </div>
        <Reveal as="p" className="section-head__aside" index={1}>
          {t.intro}
        </Reveal>
      </div>

      <div className="help">
        {t.table && (
          <div className="help__table-wrap">
            <table className="help__table">
              <caption className="sr-only">Garment measurements by size, in inches</caption>
              <thead>
                <tr>
                  {t.table.head.map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.table.rows.map((row) => (
                  <tr key={row[0]}>
                    <th scope="row">{row[0]}</th>
                    {row.slice(1).map((cell, i) => (
                      <td key={i}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {t.sections?.map((section) => (
          <section className="help__section" key={section.heading}>
            <h2 className="eyebrow">{section.heading}</h2>
            {section.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}

        <Link href="/shop" className="text-link">
          Back to the collection
        </Link>
      </div>
    </div>
  )
}
