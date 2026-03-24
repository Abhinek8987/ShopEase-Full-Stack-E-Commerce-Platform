import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0)
  const { user } = useAuth()

  const refreshCart = useCallback(async () => {
    if (!user) { setCartCount(0); return }
    try {
      const res = await api.get('/cart')
      const items = res.data.data?.items || []
      setCartCount(items.reduce((sum, i) => sum + i.quantity, 0))
    } catch { setCartCount(0) }
  }, [user])

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
