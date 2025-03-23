"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { Button } from "components/ui/button"
import type { Product } from "lib/types"
import { useToast } from "hooks/use-toast"
import { useCart } from "contexts/cart-context"
import { useAuth } from "contexts/auth-context"
import { useRouter } from "next/navigation"

interface AddToCartButtonProps {
  product: Product
  className?: string
  size?: string
  color?: string
}

export default function AddToCartButton({ product, className, size = "M", color = "Black" }: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false)
  const { toast } = useToast()
  const { addToCart, loading } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart",
        variant: "destructive"
      })
      router.push("/auth/login")
      return
    }
    
    await addToCart(product.id, 1, size, color)
    
    // Show success state
    setIsAdded(true)
    
    // Reset button after 2 seconds
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  return (
    <Button
      onClick={handleAddToCart}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Adding to Cart...
        </>
      ) : isAdded ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Added to Cart
        </>
      ) : (
        "Add to Cart"
      )}
    </Button>
  )
}
