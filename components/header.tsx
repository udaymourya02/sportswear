"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ShoppingCart, User, Menu, X, LogIn, Bot, Sparkles, ShoppingBag, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"

const categories = [
  { name: "Men", href: "/category/men" },
  { name: "Women", href: "/category/women" },
  { name: "Running", href: "/category/running" },
  { name: "Training", href: "/category/training" },
  { name: "Basketball", href: "/category/basketball" },
  { name: "Soccer", href: "/category/soccer" },
]

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { itemCount } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ${
        isScrolled ? "bg-background/95 shadow-sm" : "bg-background/80"
      }`}
    >
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              {categories.map((category, index) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-lg font-medium transition-colors hover:text-primary stagger-item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {category.name}
                </Link>
              ))}
              <Separator className="my-2" />
              <Link
                href="/ai-assistant"
                className="text-lg font-medium transition-colors hover:text-primary stagger-item flex items-center"
                style={{ animationDelay: `${categories.length * 0.05}s` }}
              >
                <Bot className="mr-2 h-5 w-5" />
                AI Shopping Assistant
              </Link>
              <Link
                href="/virtual-stylist"
                className="text-lg font-medium transition-colors hover:text-primary stagger-item flex items-center"
                style={{ animationDelay: `${(categories.length + 1) * 0.05}s` }}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Virtual Stylist
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center space-x-2 hover-lift">
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
            SportsFit
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className={`transition-colors hover:text-primary relative ${
                pathname === category.href ? "text-primary font-semibold" : "text-foreground"
              }`}
            >
              {category.name}
              <span
                className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 ${
                  pathname === category.href ? "w-full" : "group-hover:w-full"
                }`}
              />
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1 h-8 px-2">
                <Sparkles className="h-4 w-4" />
                AI Features
                <Badge className="ml-1 h-5 bg-brand-primary text-xs">New</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/ai-assistant" className="flex cursor-pointer items-center">
                  <Bot className="mr-2 h-4 w-4" />
                  AI Shopping Assistant
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/virtual-stylist" className="flex cursor-pointer items-center">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Virtual Stylist
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/ai-assistant/recommendations" className="flex cursor-pointer items-center">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Personalized Recommendations
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center space-x-4 ml-auto">
          {isSearchOpen ? (
            <div className="relative w-full max-w-sm animate-fade-in">
              <Input type="search" placeholder="Search products..." className="w-full" autoFocus />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close search</span>
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="hover-lift">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover-lift">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 animate-fade-in">
              {user ? (
                <>
                  <DropdownMenuLabel>Hi, {user.firstName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account/profile" className="flex w-full cursor-pointer items-center">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders" className="flex w-full cursor-pointer items-center">
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/wishlist" className="flex w-full cursor-pointer items-center">
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex cursor-pointer items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login" className="flex w-full cursor-pointer items-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/signup" className="flex w-full cursor-pointer items-center">
                      <User className="mr-2 h-4 w-4" />
                      Create Account
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative hover-lift">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 animate-pulse-scale">
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

