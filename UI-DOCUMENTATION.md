# Pure Path — UI Architecture

How the interface is built: the stack, the design tokens, the motion system, the
component/state model, and the responsive rules.

> **History.** The first version of this site was generated with v0 (v0.dev) — one
> 63-line `page.tsx`, no routing, unloaded fonts, a decorative cart. It has since been
> rebuilt around the same visual identity. Where a decision replaced a v0 one, it is
> marked **↺ rebuilt**.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.3** (App Router, Turbopack) | 4 real routes, 6 prerendered product pages |
| UI runtime | **React 19** | server components by default; `'use client'` only where state lives |
| Styling | **Hand-authored CSS** + Tailwind v4 token bridge | see §3 |
| Fonts | **next/font** — Inter + Cormorant Garamond | ↺ rebuilt: self-hosted, zero layout shift |
| Images | **next/image** | ↺ rebuilt: AVIF/WebP, `remotePatterns` for Unsplash |
| Icons | **lucide-react** | |
| State | React Context + `useReducer` + `localStorage` | ↺ rebuilt: [lib/store.tsx](lib/store.tsx) |
| Language | TypeScript 5.7, `strict: true` | ↺ rebuilt: `ignoreBuildErrors` removed — types are enforced |

**Node ≥ 20.9 is required** (Next 16). This machine defaults to Node 16, so run
`nvm use 22.21.1` before `pnpm dev`.

---

## 2. File map

```
app/
  layout.tsx            fonts, StoreProvider, nav, footer, overlays, scroll spine
  globals.css           the design system (§3)
  page.tsx              home
  shop/page.tsx         /shop — sort + wishlist via searchParams
  product/[id]/page.tsx /product/… — SSG, generateStaticParams + generateMetadata
  about/page.tsx        /about
  not-found.tsx         404
components/site/
  hero.tsx              server — above-fold, time-based entrance
  nav.tsx               client — scroll state, mobile menu, live counts
  footer.tsx            server
  marquee.tsx           server — CSS-only infinite ticker
  product-card.tsx      client — wishlist, size quick-add, hover cross-fade
  buy-panel.tsx         client — size/qty/add-to-bag (PDP)
  shop-client.tsx       client — fit filters + sort
  cart-drawer.tsx       client
  search-overlay.tsx    client
  dialog-shell.tsx      client — focus trap, Escape, scroll lock, restore focus
  lookbook.tsx          client — cursor-following badge
  newsletter.tsx        client
  reveal.tsx            server — <Reveal> / <Lines> scroll-animation markers
lib/
  products.ts           typed catalogue — sizes, fabric, 2 images per product
  store.tsx             cart + wishlist + overlay state, persisted
  utils.ts              cn()
```

The v0 build's `components/ui/button.tsx` was deleted — it was a shadcn scaffold the
page never imported, and the design uses semantic CSS. Restore with
`npx shadcn add button` if you ever want it.

---

## 3. The styling model

**The UI is styled with hand-authored semantic CSS**, not Tailwind utilities. Tailwind
v4 is present for the `@theme` token bridge and the occasional utility. `page.tsx`
uses semantic class names — `.hero`, `.product-card`, `.drawer` — and
[globals.css](app/globals.css) defines them, organised into 16 numbered sections.

Compiled output is ~49 KB of CSS for the entire site.

### 3.1 Tokens

```css
:root {
  /* Surface — warm bone. No pure white, no pure black. */
  --paper: #f4f1ea;  --paper-alt: #ebe6dc;  --paper-deep: #ded7c9;  --white: #fbfaf7;
  /* Ink */
  --ink: #14130f;  --ink-soft: #46443c;  --muted: #7b776e;  --muted-dim: #a09b91;
  /* Line */
  --line: #d8d3c8;  --line-strong: #bcb6a8;
  /* Accent — terracotta, used sparingly */
  --accent: #a4472f;  --accent-tint: color-mix(in oklab, var(--accent) 12%, var(--paper));
  /* Geometry — rectilinear by decision */
  --radius: 0;
}
```

Fluid scales mean the type and spacing interpolate with the viewport instead of
stepping at breakpoints:

```css
--display-lg: clamp(4rem, 10vw, 9.5rem);   /* hero */
--display-md: clamp(3.25rem, 6.5vw, 7rem); /* section headings */
--page-x:     clamp(1.25rem, 5vw, 5.5rem); /* page gutter */
--section-y:  clamp(5rem, 11vw, 10.5rem);  /* section rhythm */
```

Motion tokens (`--ease-out-expo`, `--ease-in-out-quint`, `--dur-fast/mid/slow`) are
shared by every transition, which is what makes the site feel like one object rather
than a pile of components.

### 3.2 Typography

| Role | Rule |
|---|---|
| Body | Inter 400, **14px**, `line-height: 1.6` |
| Display | Cormorant Garamond **300**, `line-height: .88`, `letter-spacing: -.035em` |
| Emphasis | `<em>` in a heading → italic serif. The signature "Essential. *Elevated.*" |
| Eyebrow | 10px, uppercase, `letter-spacing: .2em`, muted |
| UI | 9–10px, uppercase, `letter-spacing: .14em` |

`text-wrap: balance` on headings and `pretty` on paragraphs — no orphaned words.

---

## 4. The motion system

The most significant change from the v0 build, which was entirely static.

### 4.1 Scroll-driven, not JavaScript-driven

Reveals run on CSS **`view()` timelines** — no IntersectionObserver, no state, no
re-renders. They execute on the compositor.

```css
[data-reveal] {
  animation: reveal-up linear both;
  animation-timeline: view();
  animation-range-start: entry 2%;
  animation-range-end: cover calc(20% + var(--i, 0) * 7%);  /* --i staggers siblings */
}
```

Siblings stagger by *stretching the range end*, not by `animation-delay` — delays are
ignored on scroll-driven timelines.

Ranges are expressed in **`entry`**, never `cover`. `cover` spans the element's whole
pass through the viewport, so an element already fully visible on load sits at
progress ~0 and holds its hidden start state — on a tall viewport it may never
resolve, leaving content invisible. `entry` completes the moment the element has
fully entered, so anything on screen at load renders finished.

**Progressive enhancement is the rule.** Every animated element's default state is
*visible*. The timelines only attach inside
`@supports (animation-timeline: view())`, so a browser without scroll-driven
animations (Firefox today) renders the page complete and static rather than blank.

### 4.2 The vocabulary

| Marker | Effect | Used on |
|---|---|---|
| `data-reveal` | lift + fade | copy blocks |
| `data-reveal="media"` | `clip-path` unmask + de-zoom | every image |
| `data-reveal="rise"` | line rises out of the one above | headings, via `<Lines>` |
| `data-enter` | time-based twin, for above-the-fold content a scroll timeline cannot reach | hero |

Also scroll-driven: the **hero parallax + fade** (`scroll(root)`), and the **progress
spine** on the left edge — a 2px rule that scales with document scroll, zero JS.

### 4.3 `@property`

Two custom properties are registered so they can be *interpolated*, which plain
custom properties cannot:

```css
@property --fill { syntax: '<percentage>'; initial-value: 0%; inherits: false; }

.button--dark { background: linear-gradient(90deg, var(--accent) var(--fill), var(--ink) var(--fill)); }
.button--dark:hover { --fill: 100%; }   /* terracotta wipes across the button */
```

`--sweep` does the same for the light travelling along the Story section's rule.

### 4.4 Reduced motion

`prefers-reduced-motion: reduce` collapses every animation, transition and
smooth-scroll to `0.01ms`, and the scroll-driven blocks are additionally gated behind
`prefers-reduced-motion: no-preference` so they never attach in the first place.

---

## 5. Modern CSS in use

| Feature | Where | Why |
|---|---|---|
| Scroll-driven animations | reveals, parallax, progress spine | motion without JS |
| `@property` | button fill, ledger sweep | interpolatable customs |
| **Container queries** | `.product-card` | card reflows to *its slot*, not the viewport |
| `color-mix()` in oklab | accent tint, nav blur, scrims | perceptually even derived colours |
| `text-wrap: balance/pretty` | all headings and copy | no orphans |
| `mask-image` | marquee edges | the loop point is invisible |
| `overflow-x: clip` | body | clips without killing `position: sticky` |
| `scrollbar-gutter: stable` | html | overlays don't shift the layout |
| `@view-transition` | globals.css §16 | declared for native cross-document support |

---

## 6. State & data

All cart/wishlist/overlay state lives in [lib/store.tsx](lib/store.tsx) — a Context +
`useReducer` store persisted to `localStorage` under `purepath.store.v1`.

```ts
type CartLine = { productId: string; size: Size; qty: number }
```

↺ **rebuilt.** The v0 cart was `Product[]` with a hardcoded `<span>1</span>`, an
`onChange` wired to `() => {}`, and a hardcoded size of `M`. Now:

- lines are keyed on **`productId + size`**, so the same tee in M and L are separate
  rows and re-adding one increments instead of duplicating
- quantity actually works, clamped 1–10; decrementing to 0 removes the line
- subtotal is `price × qty`, with a free-shipping threshold readout
- state survives a reload, and is validated on read — a line pointing at a product
  that no longer exists is dropped

Hydration is explicit: the store starts empty, reads `localStorage` in an effect, and
exposes `hydrated`. Counts render as `0` until then, so server and client markup match.

---

## 7. Routing

↺ **rebuilt.** The v0 build had one route and faked navigation with
`useState<'home' | 'shop'>`. Now:

| Route | Rendering | Notes |
|---|---|---|
| `/` | Static | |
| `/shop` | Dynamic | `?sort=` and `?view=wishlist` via `searchParams` |
| `/product/[id]` | **SSG** | `generateStaticParams` → 6 prerendered pages, each with its own OG metadata |
| `/about` | Static | |
| `/_not-found` | Static | |

Real URLs, working back button, shareable links, per-page `<title>` and Open Graph.

---

## 8. Page composition

**Home** — Hero (100svh, parallax, masked line reveal) → Marquee → 01 Collection
(sticky intro column + vertically offset tile grid) → Editorial split with a stats row
→ 02 Shop by fit → 03 Best sellers → Lookbook (cursor badge) → 04 Story (inverted,
swept ledger rule) → Newsletter.

The `01 —` … `04 —` numbering is the editorial device that ties the page together,
carried by `.eyebrow` and the sticky `.pin` column.

**PDP** — two-image gallery beside a **sticky** buy panel: size grid (sold-out sizes
struck through with a diagonal hatch), quantity stepper, add-to-bag showing the live
line total, and three `<details>` accordions. Then a related-products row.

**Shop** — page head, toolbar with fit filter chips + live count + sort, product grid.

---

## 9. Responsive

Three structural breakpoints — 1100px (4→3 columns), 860px (the main desktop→mobile
reflow), 560px (fine-tuning). The fluid `clamp()` scales absorb everything between,
which is why so few are needed.

Plus two capability queries rather than size queries:

- `@media (hover: none)` — quick-add is always visible, the cursor badge and hover
  cross-fade are removed
- `@container (max-width: 190px)` — a squeezed product card stacks its price under
  the name

At ≤860px the mobile menu becomes a full-width sheet with 2rem serif links, rather
than the small uppercase dropdown of the v0 build.

---

## 10. Accessibility

↺ **rebuilt.** The v0 build had good `aria-label` coverage but its overlays were
plain divs.

- [dialog-shell.tsx](components/site/dialog-shell.tsx) gives the cart drawer and
  search overlay `role="dialog"` + `aria-modal`, **Escape to close, a Tab focus trap,
  focus moved in on open and restored to the trigger on close**, and a background
  scroll lock
- Skip link to `#main`
- `aria-pressed` on wishlist, filter chips and size buttons — state, not just labels
- `role="status"` on result counts and the newsletter confirmation
- Every icon-only control keeps a state-aware `aria-label`
- `:focus-visible` outline in the accent colour, 4px offset, on everything
- Sold-out sizes are `disabled` *and* labelled "sold out"

---

## 10b. Accessibility audit (WCAG)

Audited against the 45 critical/high web guidelines in the UI/UX Pro Max skill
dataset, measured on the live build rather than read off the source.

**Fixed:**

| Finding | Was | Now |
|---|---|---|
| 1.4.3 Contrast — `--muted` | 3.96:1 on paper, **3.59:1** on paper-alt | `#6b6760` → 4.99 / 4.52 |
| 1.4.3 Contrast — `--muted-dim` | **2.45:1**, used for placeholders | `#8a8377`, 3.33 / 3.02, now **large text only**; placeholders moved to `--muted` |
| 2.4.11 Focus Not Obscured | fixed nav could cover focused content | `scroll-padding-top: 6rem` |
| 2.5.8 Target Size | 18 targets under 24px | 6, all covered by the *Equivalent* exception |
| Readable font size | sort `<select>` at **9px** → iOS zoom-on-focus | 16px under 860px |
| Loading feedback | `/shop` is dynamic with no loading state | `app/shop/loading.tsx` skeleton matching the grid geometry |

The `.toolbar select` fix needed the selector named explicitly — `class + element`
outranks a bare `select` rule inside the media query, so the generic rule silently
did nothing.

**Verified passing:** viewport meta (`width=device-width, initial-scale=1` — Next
still emits it alongside a custom `viewport` export), no horizontal overflow at
390px, all form controls >= 16px, every image loading.

**Accepted, not fixed:** six product-name links are 17px tall. WCAG 2.5.8's
*Equivalent* exception applies — the card image directly above is a much larger
link to the same destination.

---

## 11. Running it

```bash
nvm use 22.21.1     # Next 16 needs Node >= 20.9
pnpm install
pnpm dev            # http://localhost:3000
pnpm build && pnpm start
```

## 12. What is still mock

Honest list of what a real store would need next:

1. **Checkout** is a button that does nothing — no payment provider.
2. **Products are a hardcoded array**; there is no CMS or commerce backend.
3. **Inventory is implied** by `product.sizes`, not tracked.
4. **Newsletter** sets local state; nothing is submitted.
5. **Size guide** and the footer's customer-care links point at `/about`.
6. **Search** filters the six local products; no search service.

---

## 13. Known-good verification

Verified in headless Chrome 151 against the production build:

- **18/18 images load** on the home page (`0 broken`, checked via CDP after a full
  scroll pass) — every `images.unsplash.com` URL resolves through the Next optimizer.
- **No horizontal overflow** at 390px: `documentElement.scrollWidth` is 391 against a
  390 viewport (1px rounding). The only wider-than-viewport elements are the marquee's
  internals, which are intentionally wide and clipped by their `overflow: hidden` parent.
- All routes return 200; `/nope` returns 404.

Two capture caveats if you screenshot this yourself: plain `chrome --screenshot` does
not wait for image decode (images drop out at random), so pass
`--run-all-compositor-stages-before-draw`; and CDP's `captureBeyondViewport` paints
`position: fixed` elements at their scroll offset, so the nav and skip link appear
mid-page in a full-page capture. Neither is a site defect.
