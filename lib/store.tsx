'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import { type Product, type Size } from '@/lib/products'

/* ---------------------------------------------------------------- types -- */

export type CartLine = { productId: string; size: Size; qty: number }

type CartState = { lines: CartLine[]; wishes: string[] }

type CartAction =
  | { type: 'hydrate'; state: CartState }
  | { type: 'add'; productId: string; size: Size; qty: number }
  | { type: 'setQty'; productId: string; size: Size; qty: number }
  | { type: 'remove'; productId: string; size: Size }
  | { type: 'clear' }
  | { type: 'toggleWish'; productId: string }

const EMPTY: CartState = { lines: [], wishes: [] }
const STORAGE_KEY = 'stillfits.store.v1'

/* -------------------------------------------------------------- reducer -- */

const sameLine = (l: CartLine, productId: string, size: Size) =>
  l.productId === productId && l.size === size

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'hydrate':
      return action.state

    case 'add': {
      const existing = state.lines.find((l) => sameLine(l, action.productId, action.size))
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            sameLine(l, action.productId, action.size)
              ? { ...l, qty: Math.min(l.qty + action.qty, 10) }
              : l,
          ),
        }
      }
      return {
        ...state,
        lines: [...state.lines, { productId: action.productId, size: action.size, qty: action.qty }],
      }
    }

    case 'setQty': {
      // Clamping to 0 removes the line — the drawer's minus button relies on it.
      if (action.qty <= 0) {
        return {
          ...state,
          lines: state.lines.filter((l) => !sameLine(l, action.productId, action.size)),
        }
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          sameLine(l, action.productId, action.size) ? { ...l, qty: Math.min(action.qty, 10) } : l,
        ),
      }
    }

    case 'remove':
      return {
        ...state,
        lines: state.lines.filter((l) => !sameLine(l, action.productId, action.size)),
      }

    case 'clear':
      return { ...state, lines: [] }

    case 'toggleWish':
      return {
        ...state,
        wishes: state.wishes.includes(action.productId)
          ? state.wishes.filter((id) => id !== action.productId)
          : [...state.wishes, action.productId],
      }
  }
}

/* ---------------------------------------------------------- persistence -- */

function readStorage(known: (id: string) => boolean): CartState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<CartState>
    return {
      // Drop anything referencing a product that no longer exists.
      lines: Array.isArray(parsed.lines) ? parsed.lines.filter((l) => l && known(l.productId)) : [],
      wishes: Array.isArray(parsed.wishes) ? parsed.wishes.filter(known) : [],
    }
  } catch {
    return EMPTY
  }
}

/* -------------------------------------------------------------- context -- */

export type StoreValue = {
  /** Catalogue snapshot from the server, shared by cart, search and wishlist. */
  products: Product[]
  /** False during the first client render, before localStorage is read. */
  hydrated: boolean
  lines: CartLine[]
  wishes: string[]
  items: { line: CartLine; product: Product }[]
  count: number
  subtotal: number
  add: (productId: string, size: Size, qty?: number) => void
  setQty: (productId: string, size: Size, qty: number) => void
  remove: (productId: string, size: Size) => void
  clear: () => void
  toggleWish: (productId: string) => void
  isWished: (productId: string) => boolean
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({
  products,
  children,
}: {
  /**
   * Catalogue snapshot, passed down from the server.
   *
   * The cart lives in the browser and cannot query MongoDB, so it resolves
   * line items against this rather than importing a hardcoded array.
   */
  products: Product[]
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(reducer, EMPTY)
  const [hydrated, setHydrated] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Index once; the cart looks products up on every render.
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  useEffect(() => {
    dispatch({ type: 'hydrate', state: readStorage((id) => byId.has(id)) })
    setHydrated(true)
    // Only on mount: a later catalogue change must not wipe the saved cart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* private mode / quota — the cart just won't survive a reload */
    }
  }, [state, hydrated])

  const add = useCallback((productId: string, size: Size, qty = 1) => {
    dispatch({ type: 'add', productId, size, qty })
    setCartOpen(true)
  }, [])

  const value = useMemo<StoreValue>(() => {
    const items = state.lines.flatMap((line) => {
      const product = byId.get(line.productId)
      return product ? [{ line, product }] : []
    })
    return {
      products,
      hydrated,
      lines: state.lines,
      wishes: state.wishes,
      items,
      count: state.lines.reduce((n, l) => n + l.qty, 0),
      subtotal: items.reduce((sum, { line, product }) => sum + product.price * line.qty, 0),
      add,
      setQty: (productId, size, qty) => dispatch({ type: 'setQty', productId, size, qty }),
      remove: (productId, size) => dispatch({ type: 'remove', productId, size }),
      clear: () => dispatch({ type: 'clear' }),
      toggleWish: (productId) => dispatch({ type: 'toggleWish', productId }),
      isWished: (productId) => state.wishes.includes(productId),
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
    }
  }, [state, hydrated, cartOpen, searchOpen, add, byId, products])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
