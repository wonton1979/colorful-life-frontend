import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/useAuth.ts'
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from './api.ts'
import { CartContext } from './cartContext.ts'
import type { Cart } from './types.ts'

export function CartProvider({ children }: { children: ReactNode }) {
  const { state: authState } = useAuth()
  const usable = authState.status === 'authenticated' || authState.status === 'authenticated-unverified'
  const authToken = usable ? authState.token : null
  const [cart, setCart] = useState<Cart | null>(null)
  const [status, setStatus] = useState<'unavailable' | 'loading' | 'loaded' | 'error'>('unavailable')

  useEffect(() => {
    if (!usable) {
      return
    }
    let cancelled = false
    getCart().then((data) => {
      if (!cancelled) { setCart(data); setStatus('loaded') }
    }).catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [authToken, usable])

  const replace = useCallback(async (request: () => Promise<Cart>) => {
    const data = await request()
    setCart(data)
    setStatus('loaded')
    return data
  }, [])
  const addItem = useCallback((id: number, quantity: number) => replace(() => addCartItem(id, quantity)), [replace])
  const updateItem = useCallback((id: number, quantity: number) => replace(() => updateCartItem(id, quantity)), [replace])
  const removeItem = useCallback((id: number) => replace(() => removeCartItem(id)), [replace])
  const clear = useCallback(() => replace(clearCart), [replace])
  const visibleCart = usable ? cart : null
  const visibleStatus = usable ? (status === 'unavailable' ? 'loading' : status) : 'unavailable' as const
  const value = useMemo(() => ({ cart: visibleCart, status: visibleStatus, totalQuantity: visibleCart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0, addItem, updateItem, removeItem, clearCart: clear }), [addItem, clear, removeItem, updateItem, visibleCart, visibleStatus])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
