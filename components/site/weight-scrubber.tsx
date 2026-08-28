'use client'

import { useId, useMemo } from 'react'
import { products } from '@/lib/products'

/**
 * Shop by hand-feel.
 *
 * Every other tee store sorts by colour and size — the two least interesting
 * axes. This brand's actual differentiator is fabric weight, which until now
 * sat as a dead string in the spec row.
 *
 * Dragging re-sorts the grid by proximity to the chosen GSM. Nothing is ever
 * hidden: the nearest match is badged and the rest follow in order, so the
 * control teaches without costing anyone a product.
 *
 * Built on a native <input type="range"> so it is keyboard-operable and
 * announced correctly; the wedge and ticks are decoration layered behind it.
 */

const MIN = 155
const MAX = 265

const BANDS = [
  { upto: 175, label: 'Featherweight', note: 'Layers under everything.' },
  { upto: 195, label: 'Everyday', note: 'The weight you stop noticing.' },
  { upto: 215, label: 'Substantial', note: 'Holds its shape through the day.' },
  { upto: 240, label: 'Heavy', note: 'Structured. Stands slightly away.' },
  { upto: 999, label: 'Outerweight', note: 'Wears like a light layer.' },
]

export function bandFor(gsm: number) {
  return BANDS.find((b) => gsm <= b.upto) ?? BANDS[BANDS.length - 1]
}

const pct = (gsm: number) => ((gsm - MIN) / (MAX - MIN)) * 100

export function WeightScrubber({
  value,
  onChange,
  onReset,
}: {
  value: number | null
  onChange: (gsm: number) => void
  onReset: () => void
}) {
  const id = useId()
  const active = value !== null
  const current = value ?? 205
  const band = bandFor(current)

  // One tick per real product weight, so you can feel where the line sits.
  const ticks = useMemo(
    () => [...new Set(products.map((p) => p.gsm))].sort((a, b) => a - b),
    [],
  )

  return (
    <section className="scrubber" data-active={active}>
      <div className="scrubber__head">
        <div>
          <span className="eyebrow">Shop by hand-feel</span>
          <p className="scrubber__readout" aria-hidden="true">
            {active ? (
              <>
                <strong>{current}</strong>
                <span className="scrubber__unit">GSM</span>
                <em>{band.label}</em>
              </>
            ) : (
              <span className="scrubber__prompt">Drag to shop by fabric weight</span>
            )}
          </p>
        </div>
        {active && (
          <button className="link-quiet" onClick={onReset}>
            Reset
          </button>
        )}
      </div>

      <div className="scrubber__control">
        {/* Wedge: thin at 160 GSM, thick at 260 — the weight made visible. */}
        <div className="scrubber__wedge" aria-hidden="true" />

        <div className="scrubber__ticks" aria-hidden="true">
          {ticks.map((t) => (
            <span
              key={t}
              className="scrubber__tick"
              data-near={active && Math.abs(t - current) <= 12}
              style={{ left: `${pct(t)}%` }}
            >
              <i />
              <b>{t}</b>
            </span>
          ))}
        </div>

        <label htmlFor={id} className="sr-only">
          Fabric weight in GSM
        </label>
        <input
          id={id}
          className="scrubber__range"
          type="range"
          min={MIN}
          max={MAX}
          step={5}
          value={current}
          aria-valuetext={
            active ? `${current} GSM — ${band.label}. ${band.note}` : 'Not set. Drag to shop by fabric weight.'
          }
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>

      <p className="scrubber__note" role="status">
        {active ? band.note : ' '}
      </p>
    </section>
  )
}
