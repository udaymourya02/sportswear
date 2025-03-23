"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Bot, ArrowRight, Search, ShoppingBag, Sparkles, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAIAssistant } from "@/contexts/ai-assistant-context"
import { ChatInterface } from "@/components/ai-shopping-assistant/chat-interface"
import { ApiNotice } from "@/components/ai-shopping-assistant/api-notice"
import { mockProducts } from "@/lib/mock-data"

export default function AIAssistantPage() {
  const { personalizedRecommendations, refreshRecommendations } = useAIAssistant()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<typeof mockProducts>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Simulate search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Simple search implementation
    const results = mockProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    setSearchResults(results)
    setHasSearched(true)
  }

  // Recent searches (mock data)
  const recentSearches = ["running shoes", "compression shirts", "basketball", "women's leggings"]

  // Popular categories (mock data)
  const popularCategories = [
    { name: "Running", icon: "🏃‍♂️" },
    { name: "Training", icon: "💪" },
    { name: "Basketball", icon: "🏀" },
    { name: "Women's", icon: "👚" },
    { name: "Men's", icon: "👕" },
    { name: "Shoes", icon: "👟" },
  ]

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">AI Shopping Assistant</h1>
          <p className="text-muted-foreground">Get personalized help finding the perfect sportswear for your needs</p>
        </div>

        <ApiNotice />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader className="bg-muted/50 border-b">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>SportsFit Assistant</CardTitle>
                    <CardDescription>Ask me anything about our products or get recommendations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(600px-76px-65px)]">
                <ChatInterface />
              </CardContent>
              <CardFooter className="border-t bg-muted/30 text-xs text-muted-foreground">
                <p>
                  This AI assistant can help with product recommendations, sizing advice, and more. It uses your
                  preferences to provide personalized assistance.
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Search</CardTitle>
                <CardDescription>Find exactly what you're looking for</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch}>
                  <div className="flex w-full items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </form>

                {hasSearched ? (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Results for "{searchQuery}"</h4>
                    {searchResults.length > 0 ? (
                      <div className="space-y-3">
                        {searchResults.slice(0, 3).map((product) => (
                          <Link key={product.id} href={`/product/${product.slug}`}>
                            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted group">
                              <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                  src={product.images[0] || "/placeholder.svg"}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h5 className="font-medium text-sm group-hover:text-primary transition-colors">
                                  {product.name}
                                </h5>
                                <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                        {searchResults.length > 3 && (
                          <Button variant="link" asChild className="px-0">
                            <Link href={`/search?q=${encodeURIComponent(searchQuery)}`}>
                              View all {searchResults.length} results <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No products found</p>
                        <p className="text-sm mt-1">Try a different search term or ask our AI assistant for help</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <History className="h-3.5 w-3.5 mr-1" /> Recent Searches
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <Badge
                          key={term}
                          variant="outline"
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => setSearchQuery(term)}
                        >
                          {term}
                        </Badge>
                      ))}
                    </div>

                    <h4 className="text-sm font-medium mb-2 mt-4 flex items-center">
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> Popular Categories
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {popularCategories.map((category) => (
                        <Link key={category.name} href={`/category/${category.name.toLowerCase()}`}>
                          <div className="flex flex-col items-center p-2 rounded-md hover:bg-muted text-center">
                            <span className="text-xl">{category.icon}</span>
                            <span className="text-xs mt-1">{category.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personalized Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">For You</CardTitle>
                <CardDescription>Personalized recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalizedRecommendations.slice(0, 3).map((recommendation) => {
                    const product = mockProducts.find((p) => p.id === recommendation.id)
                    if (!product) return null

                    return (
                      <Link key={product.id} href={`/product/${product.slug}`}>
                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted group">
                          <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h5 className="font-medium text-sm group-hover:text-primary transition-colors">
                              {product.name}
                            </h5>
                            <p className="text-xs text-muted-foreground">{recommendation.reason}</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                <Button variant="link" asChild className="px-0 mt-2">
                  <Link href="/ai-assistant/recommendations">
                    View all recommendations <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/ai-assistant/recommendations">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Personalized Recommendations
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/virtual-stylist">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Virtual Stylist
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

