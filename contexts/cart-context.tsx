"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { cartAPI } from "@/lib/api"
import { useAuth } from "./auth-context"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  _id: string
  product: {
    _id: string
    name: string
    price: number
    images: string[]
    slug: string
  }
  quantity: number
  size: string
  color: string
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  error: string | null
  addToCart: (productId: string, quantity: number, size: string, color: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Calculate derived values
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)

  // Fetch cart when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          setLoading(true)
          const { cart } = await cartAPI.getCart()
          setItems(cart.items)
        } catch (error) {
          console.error("Failed to fetch cart:", error)
          // Don't show error toast on initial load
        } finally {
          setLoading(false)
        }
      } else {
        // Clear cart when user logs out
        setItems([])
      }
    }

    fetchCart()
  }, [user])

  const addToCart = async (productId: string, quantity: number, size: string, color: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add items to your cart",
          variant: "destructive",
        })
        return
      }

      const { cart } = await cartAPI.addToCart({ productId, quantity, size, color })
      setItems(cart.items)

      toast({
        title: "Item added to cart",
        description: "Your item has been added to the cart",
      })
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to add item to cart")
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add item to cart",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setLoading(true)
      setError(null)
      const { cart } = await cartAPI.updateCartItem(itemId, quantity)
      setItems(cart.items)
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update cart")
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update cart",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      setLoading(true)
      setError(null)
      const { cart } = await cartAPI.removeCartItem(itemId)
      setItems(cart.items)

      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      })
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to remove item from cart")
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove item from cart",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      setLoading(true)
      setError(null)
      const { cart } = await cartAPI.clearCart()
      setItems(cart.items)

      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      })
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to clear cart")
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to clear cart",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

