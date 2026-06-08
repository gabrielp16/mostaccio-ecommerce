import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'storefront_cart'

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product._id)
      if (existing) {
        return current.map((item) =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [
        ...current,
        {
          productId: product._id,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity: 1,
        },
      ]
    })
  }

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const clearCart = () => setCart([])

  const totals = useMemo(() => {
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0)
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const shipping = subtotal > 0 ? 9.9 : 0
    const total = subtotal + shipping
    return { itemCount, subtotal, shipping, total }
  }, [cart])

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totals,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
