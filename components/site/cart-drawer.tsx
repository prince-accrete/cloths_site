'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useStore } from '@/lib/store'
import { DialogShell } from './dialog-shell'

const FREE_SHIPPING = 150

export function CartDrawer() {
  const { cartOpen, setCartOpen, items, count, subtotal, setQty, remove } = useStore()
  const close = () => setCartOpen(false)
  const remaining = Math.max(0, FREE_SHIPPING - subtotal)

  return (
    <DialogShell open={cartOpen} onClose={close} label="Shopping bag" className="drawer">
      <div className="drawer__head">
        <div>
          <span className="eyebrow">Your selection</span>
          <h2>
            Bag <small>({count})</small>
          </h2>
        </div>
        <button className="icon-button" onClick={close} aria-label="Close bag">
          <X size={20} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="drawer__empty">
          <ShoppingBag size={26} strokeWidth={1.2} />
          <p>Your bag is waiting.</p>
          <Link href="/shop" className="text-link" onClick={close}>
            Continue shopping <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          <div className="drawer__body">
            {items.map(({ line, product }, i) => (
              <div
                className="line-item"
                key={`${line.productId}-${line.size}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Link href={`/product/${product.id}`} className="line-item__media" onClick={close}>
                  <Image
                    src={product.images[0].src}
                    alt={product.images[0].alt}
                    fill
                    sizes="84px"
                  />
                </Link>

                <div className="line-item__info">
                  <h3>
                    <Link href={`/product/${product.id}`} onClick={close}>
                      {product.name}
                    </Link>
                  </h3>
                  <p className="meta">
                    {product.color} · Size {line.size}
                  </p>

                  <div className="qty">
                    <button
                      onClick={() => setQty(line.productId, line.size, line.qty - 1)}
                      aria-label={`Decrease quantity of ${product.name}, size ${line.size}`}
                    >
                      <Minus size={13} />
                    </button>
                    <output aria-label="Quantity">{line.qty}</output>
                    <button
                      onClick={() => setQty(line.productId, line.size, line.qty + 1)}
                      disabled={line.qty >= 10}
                      aria-label={`Increase quantity of ${product.name}, size ${line.size}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                <div className="line-item__side">
                  <span>${product.price * line.qty}</span>
                  <button
                    className="link-quiet"
                    onClick={() => remove(line.productId, line.size)}
                    aria-label={`Remove ${product.name}, size ${line.size}, from bag`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="drawer__foot">
            <div className="drawer__total">
              <span className="eyebrow">Subtotal</span>
              <strong>${subtotal}</strong>
            </div>
            <p className="meta">
              {remaining > 0
                ? `$${remaining} from complimentary shipping.`
                : 'Complimentary shipping unlocked.'}
            </p>
            <button className="button button--dark button--block">
              Checkout <ArrowRight size={15} />
            </button>
          </div>
        </>
      )}
    </DialogShell>
  )
}
