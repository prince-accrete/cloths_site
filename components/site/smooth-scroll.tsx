'use client'

import { useEffect } from 'react'

/**
 * The site's sole smooth-scroll engine.
 *
 * Lenis is chosen over Locomotive and only one is ever installed — running two
 * engines fights over the same scroll position. It is loaded dynamically so it
 * never lands in the initial bundle and never runs on the server.
 *
 * Lenis smooths the *native* scroll position rather than transforming a
 * wrapper, so the CSS scroll-driven animations in globals.css §06
 * (`animation-timeline: scroll()` / `view()`) keep working untouched.
 *
 * Bypassed entirely under `prefers-reduced-motion: reduce` — the page falls
 * back to the browser's own scrolling rather than a shortened animation.
 */
export function SmoothScroll() {
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null
    let frame = 0
    let cancelled = false

    const start = async () => {
      if (query.matches || cancelled) return
      const { default: Lenis } = await import('lenis')
      if (cancelled) return

      lenis = new Lenis({
        // ~1s to settle: enough to read as smooth, short enough that the page
        // still responds immediately to a flick.
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // Never intercept horizontal or touch scrolling — hijacking touch is
        // what makes smooth-scroll sites feel broken on phones.
        smoothWheel: true,
        touchMultiplier: 1.6,
        syncTouch: false,
      })

      const raf = (time: number) => {
        lenis?.raf(time)
        frame = requestAnimationFrame(raf)
      }
      frame = requestAnimationFrame(raf)
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      lenis?.destroy()
      lenis = null
    }

    // Respond if the user flips the OS setting mid-session.
    const onChange = () => {
      stop()
      if (!query.matches) start()
    }

    start()
    query.addEventListener('change', onChange)

    return () => {
      cancelled = true
      query.removeEventListener('change', onChange)
      stop()
    }
  }, [])

  return null
}
