"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, RefreshCw, ThumbsUp, ThumbsDown, Info, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useAIAssistant } from "@/contexts/ai-assistant-context"
import { ApiNotice } from "@/components/ai-shopping-assistant/api-notice"
import { mockProducts } from "@/lib/mock-data"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function RecommendationsPage() {
  const { personalizedRecommendations, refreshRecommendations, isLoading, userPreferences, updateUserPreferences } =
    useAIAssistant()
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "like" | "dislike" | null>>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 200])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [filteredRecommendations, setFilteredRecommendations] = useState(personalizedRecommendations)

  // Update filtered recommendations when personalizedRecommendations change
  useEffect(() => {
    setFilteredRecommendations(personalizedRecommendations)
  }, [personalizedRecommendations])

  const handleFeedback = (productId: string, type: "like" | "dislike") => {
    setFeedbackGiven((prev) => ({ ...prev, [productId]: type }))
    // In a real app, this would send feedback to the recommendation system
  }

  // Find the full product details from our mock data
  const getProductDetails = (productId: string) => {
    return mockProducts.find((p) => p.id === productId) || null
  }

  // Categories for filtering
  const categories = ["Running", "Training", "Basketball", "Soccer", "Men", "Women"]

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Apply filters
  const applyFilters = () => {
    let filtered = [...personalizedRecommendations]

    // Filter by price
    filtered = filtered.filter((rec) => {
      const product = getProductDetails(rec.id)
      if (!product) return false
      return product.price >= priceRange[0] && product.price <= priceRange[1]
    })

    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((rec) => {
        const product = getProductDetails(rec.id)
        if (!product) return false
        return selectedCategories.includes(product.category)
      })
    }

    setFilteredRecommendations(filtered)
    setFiltersOpen(false)
  }

  // Reset filters
  const resetFilters = () => {
    setPriceRange([0, 200])
    setSelectedCategories([])
    setFilteredRecommendations(personalizedRecommendations)
    setFiltersOpen(false)
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div>
          <Link href="/ai-assistant" className="text-muted-foreground hover:text-foreground flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to AI Assistant
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Personalized Recommendations</h1>
              <p className="text-muted-foreground">Products selected just for you based on your preferences</p>
            </div>
            <Button onClick={refreshRecommendations} disabled={isLoading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <ApiNotice />

        <div className="flex items-center justify-between">
          <Tabs defaultValue="all" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="new">New Arrivals</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>
          </Tabs>

          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Recommendations</SheetTitle>
                <SheetDescription>Narrow down recommendations based on your preferences</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Price Range</h4>
                  <Slider
                    defaultValue={priceRange}
                    max={200}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Categories</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={`category-${category}`}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredRecommendations.length === 0 && isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : filteredRecommendations.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No recommendations match your filters</p>
              <Button variant="outline" onClick={resetFilters} className="mt-4">
                Reset Filters
              </Button>
            </div>
          ) : (
            filteredRecommendations.map((recommendation) => {
              const product = getProductDetails(recommendation.id)
              if (!product) return null

              return (
                <Card key={recommendation.id} className="overflow-hidden group">
                  <Link href={`/product/${product.slug}`}>
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {product.isNew && (
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">New</Badge>
                      )}
                      <div className="absolute top-2 right-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/80">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              <p>{recommendation.reason}</p>
                              <p className="text-xs mt-1">Confidence: {Math.round(recommendation.confidence * 100)}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </Link>

                  <CardContent className="p-4">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">${product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-full ${
                            feedbackGiven[recommendation.id] === "like" ? "bg-green-100 text-green-600" : ""
                          }`}
                          onClick={() => handleFeedback(recommendation.id, "like")}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span className="sr-only">Like</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-full ${
                            feedbackGiven[recommendation.id] === "dislike" ? "bg-red-100 text-red-600" : ""
                          }`}
                          onClick={() => handleFeedback(recommendation.id, "dislike")}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span className="sr-only">Dislike</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{recommendation.reason}</p>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        <Card className="bg-muted/30 border-dashed">
          <CardHeader>
            <CardTitle>Your Preference Profile</CardTitle>
            <CardDescription>This information is used to generate your recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Recently Viewed</h4>
                <div className="flex flex-wrap gap-2">
                  {userPreferences.recentlyViewed.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Previous Purchases</h4>
                <div className="flex flex-wrap gap-2">
                  {userPreferences.previousPurchases.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Favorite Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {userPreferences.favoriteCategories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Activity Level</h4>
                <p className="text-sm text-muted-foreground">{userPreferences.userActivity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

