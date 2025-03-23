import type React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">SportsFit</span>
          </Link>
        </div>
      </header>
      <div className="container py-8">
        <nav className="mb-6 flex items-center space-x-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/cart" className="hover:text-foreground">
            Cart
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Checkout</span>
        </nav>
        {children}
      </div>
    </div>
  )
}

