export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

export type Product = {
  id: string
  name: string
  price: number
  fit: 'Regular Fit' | 'Relaxed Fit' | 'Oversized'
  color: string
  swatch: string
  fabric: string
  images: { src: string; alt: string }[]
  tagline: string
  description: string
  details: string[]
  sizes: Size[]
  badge?: 'Bestseller' | 'New' | 'Last few'
}

export const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const products: Product[] = [
  {
    id: 'heavyweight',
    name: 'The Heavyweight Tee',
    price: 68,
    fit: 'Regular Fit',
    color: 'Bone',
    swatch: '#e3ddd0',
    fabric: 'Organic combed cotton',
    tagline: 'Structure that holds its shape.',
    description:
      'Our densest knit, cut to stand slightly away from the body. It arrives with weight and keeps it — the collar stays flat, the hem stays true, and the fabric softens without slumping.',
    details: [
      'Organic combed cotton',
      'Tubular body — no side seams to twist',
      'Twin-needle collarette, ribbed 2×1',
      'Garment-washed for zero first-wash shrink',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    badge: 'Bestseller',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1400&q=88',
        alt: 'Model wearing the bone heavyweight t-shirt, shot from the front',
      },
      {
        src: 'https://images.unsplash.com/photo-1651761179569-4ba2aa054997?w=1400&q=88',
        alt: 'The heavyweight tee laid flat, showing the collar and hem',
      },
    ],
  },
  {
    id: 'everyday',
    name: 'The Everyday Tee',
    price: 54,
    fit: 'Relaxed Fit',
    color: 'Optic White',
    swatch: '#f6f4ef',
    fabric: 'Long-staple Supima cotton',
    tagline: 'The one that disappears into the rotation.',
    description:
      'Light enough to layer, opaque enough to wear alone. We spent four rounds on the shoulder drop alone — it should read relaxed without reading borrowed.',
    details: [
      'Long-staple Supima cotton',
      'Dropped shoulder, 2cm below the natural line',
      'Single-needle hem for a flatter finish',
      'Reactive-dyed in small batches',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1651761179569-4ba2aa054997?w=1400&q=88',
        alt: 'Optic white everyday t-shirt laid flat on a pale ground',
      },
      {
        src: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=1400&q=88',
        alt: 'The everyday tee hung against a dark concrete wall',
      },
    ],
  },
  {
    id: 'studio',
    name: 'The Studio Tee',
    price: 62,
    fit: 'Oversized',
    color: 'Washed Black',
    swatch: '#2a2825',
    fabric: 'Pigment-dyed cotton jersey',
    tagline: 'More room. More presence.',
    description:
      'Cut wide through the chest and cropped a touch at the hem so the volume reads intentional. Pigment dyed, which means it will fade — slowly, unevenly, and in exactly your shape.',
    details: [
      'Pigment-dyed cotton jersey',
      'Boxy body, 4cm extended shoulder',
      'Wash cold — the fade is the point',
      'Pre-shrunk, holds its width',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    badge: 'New',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1599255068390-206e0d068539?w=1400&q=88',
        alt: 'The washed black studio tee worn loose, showing the boxy cut',
      },
      {
        src: 'https://images.unsplash.com/photo-1610502778270-c5c6f4c7d575?w=1400&q=88',
        alt: 'Studio tees hung in a row, showing the washed black colour',
      },
    ],
  },
  {
    id: 'pima',
    name: 'The Pima Tee',
    price: 58,
    fit: 'Regular Fit',
    color: 'Oat',
    swatch: '#d9cfbb',
    fabric: 'Peruvian Pima cotton',
    tagline: 'Quietly the softest thing you own.',
    description:
      'Peruvian Pima, hand-picked and combed twice. The hand-feel is closer to silk than to jersey, and it holds a drape most cotton simply cannot.',
    details: [
      'Peruvian Pima cotton',
      'Combed twice for a low-pill surface',
      'Bound neckline, no visible topstitch',
      'Naturally resists fading',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1666358084687-14347fbf364c?w=1400&q=88',
        alt: 'Oat coloured Pima cotton t-shirt worn close to the body',
      },
      {
        src: 'https://images.unsplash.com/photo-1654432008965-be24166fb425?w=1400&q=88',
        alt: 'The Pima tee worn outdoors in soft daylight',
      },
    ],
  },
  {
    id: 'ribbed',
    name: 'The Ribbed Tee',
    price: 56,
    fit: 'Relaxed Fit',
    color: 'Moss',
    swatch: '#6b7358',
    fabric: 'Ribbed cotton-modal',
    tagline: 'Texture doing the talking.',
    description:
      'A fine 2×2 rib that follows the body without gripping it. The modal content gives it recovery, so it comes out of the wash the same shape it went in.',
    details: [
      'Cotton-modal rib',
      '2×2 rib, fine gauge',
      'Four-way recovery — no bagging at the elbow',
      'Piece-dyed for depth of colour',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    badge: 'Last few',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1661008674962-5d6729cfe227?w=1400&q=88',
        alt: 'Moss green ribbed t-shirt worn by a model in daylight',
      },
      {
        src: 'https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?w=1400&q=88',
        alt: 'Close crop of the ribbed knit structure',
      },
    ],
  },
  {
    id: 'essential',
    name: 'The Essential Tee',
    price: 52,
    fit: 'Regular Fit',
    color: 'Charcoal',
    swatch: '#57554f',
    fabric: 'Recycled cotton blend',
    tagline: 'Where the wardrobe starts.',
    description:
      'The baseline. Nothing on it, nothing in it that does not need to be there — which is precisely why it is the one that runs out first.',
    details: [
      'Recycled cotton blend',
      '40% post-industrial reclaimed fibre',
      'Standard body, set-in sleeve',
      'Made in a Fair Wear audited facility',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1737094540214-261561588b89?w=1400&q=88',
        alt: 'Charcoal essential t-shirts laid flat, front and back',
      },
      {
        src: 'https://images.unsplash.com/photo-1779286595639-195e8bc2d375?w=1400&q=88',
        alt: 'The essential tee worn against a plain wall',
      },
    ],
  },
]

export const FITS = ['Regular Fit', 'Relaxed Fit', 'Oversized'] as const

export function getProduct(id: string) {
  return products.find((p) => p.id === id)
}

export function formatPrice(cents: number) {
  return `$${cents}`
}

