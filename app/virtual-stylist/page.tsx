"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Shirt,
  PinIcon as PantsIcon,
  Footprints,
  Heart,
  ShoppingCart,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useAIAssistant } from "@/contexts/ai-assistant-context"
import { ApiNotice } from "@/components/ai-shopping-assistant/api-notice"
import { mockProducts } from "@/lib/mock-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function VirtualStylistPage() {
  const { outfitRecommendations, refreshOutfits, isLoading, userProfile, updateUserProfile } = useAIAssistant()
  const [selectedOutfit, setSelectedOutfit] = useState<number | null>(null)
  const [savedOutfits, setSavedOutfits] = useState<number[]>([])

  // Reset selected outfit when recommendations change
  useEffect(() => {
    setSelectedOutfit(null)
  }, [outfitRecommendations])

  const handleOccasionChange = (value: string) => {
    updateUserProfile({ occasion: value })
  }

  const handleGenderChange = (value: string) => {
    updateUserProfile({ gender: value })
  }

  const handleBodyTypeChange = (value: string) => {
    updateUserProfile({ bodyType: value })
  }

  const handlePreferenceChange = (value: string) => {
    const currentPreferences = [...userProfile.preferences]
    const index = currentPreferences.indexOf(value)

    if (index === -1) {
      // Add preference if not already selected
      updateUserProfile({ preferences: [...currentPreferences, value] })
    } else {
      // Remove preference if already selected
      currentPreferences.splice(index, 1)
      updateUserProfile({ preferences: currentPreferences })
    }
  }

  // Find a product image based on name (simplified for demo)
  const findProductImage = (name: string) => {
    const product = mockProducts.find((p) => p.name.toLowerCase().includes(name.toLowerCase().split(" ")[0]))
    return product?.images[0] || "/placeholder.svg"
  }

  // Find a product by name
  const findProduct = (name: string) => {
    return mockProducts.find((p) => p.name.toLowerCase().includes(name.toLowerCase().split(" ")[0]))
  }

  // Get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "top":
      case "shirt":
      case "jacket":
        return <Shirt className="h-4 w-4" />
      case "bottom":
      case "pants":
      case "shorts":
        return <PantsIcon className="h-4 w-4" />
      case "footwear":
      case "shoes":
        return <Footprints className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  // Toggle save outfit
  const toggleSaveOutfit = (index: number) => {
    setSavedOutfits((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  // Style preferences options
  const stylePreferences = [
    "Comfortable",
    "Performance",
    "Modern",
    "Minimalist",
    "Colorful",
    "Classic",
    "Trendy",
    "Sustainable",
  ]

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div>
          <Link href="/ai-assistant" className="text-muted-foreground hover:text-foreground flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to AI Assistant
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Virtual Stylist</h1>
              <p className="text-muted-foreground">Get personalized outfit recommendations based on your preferences</p>
            </div>
            <Button onClick={refreshOutfits} disabled={isLoading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Outfits
            </Button>
          </div>
        </div>

        <ApiNotice />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Stylist Controls */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Style Profile</CardTitle>
                <CardDescription>Customize to get better recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={userProfile.gender} onValueChange={handleGenderChange}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="bodyType">Body Type</Label>
                  <Select value={userProfile.bodyType} onValueChange={handleBodyTypeChange}>
                    <SelectTrigger id="bodyType">
                      <SelectValue placeholder="Select body type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Athletic">Athletic</SelectItem>
                      <SelectItem value="Slim">Slim</SelectItem>
                      <SelectItem value="Muscular">Muscular</SelectItem>
                      <SelectItem value="Curvy">Curvy</SelectItem>
                      <SelectItem value="Plus-size">Plus-size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="occasion">Occasion</Label>
                  <Select value={userProfile.occasion} onValueChange={handleOccasionChange}>
                    <SelectTrigger id="occasion">
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gym workout">Gym workout</SelectItem>
                      <SelectItem value="Running">Running</SelectItem>
                      <SelectItem value="Casual outing">Casual outing</SelectItem>
                      <SelectItem value="Outdoor activities">Outdoor activities</SelectItem>
                      <SelectItem value="Yoga">Yoga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Style Preferences</Label>
                  <div className="flex flex-wrap gap-2">
                    {stylePreferences.map((preference) => (
                      <Badge
                        key={preference}
                        variant={userProfile.preferences.includes(preference) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handlePreferenceChange(preference)}
                      >
                        {preference}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    updateUserProfile({
                      gender: "Male",
                      bodyType: "Athletic",
                      preferences: ["Comfortable", "Performance", "Modern"],
                      occasion: "Gym workout",
                    })
                  }}
                >
                  Reset
                </Button>
                <Button onClick={refreshOutfits} disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate Outfits"}
                </Button>
              </CardFooter>
            </Card>

            {savedOutfits.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Saved Outfits</CardTitle>
                  <CardDescription>Your favorite outfit combinations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedOutfits.map((index) => {
                      const outfit = outfitRecommendations[index]
                      if (!outfit) return null

                      return (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                          <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                            {outfit.items[0] && (
                              <Image
                                src={findProductImage(outfit.items[0].name) || "/placeholder.svg"}
                                alt={outfit.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{outfit.name}</h4>
                            <p className="text-xs text-muted-foreground">{outfit.occasion}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedOutfit(index)}
                          >
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Outfit Recommendations */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Creating outfit recommendations...</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
                </div>
              </Card>
            ) : outfitRecommendations.length === 0 ? (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">No outfit recommendations available.</p>
                  <Button variant="outline" size="sm" onClick={refreshOutfits} className="mt-4">
                    Generate Outfits
                  </Button>
                </div>
              </Card>
            ) : selectedOutfit !== null ? (
              // Detailed outfit view
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedOutfit(null)}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle>{outfitRecommendations[selectedOutfit].name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSaveOutfit(selectedOutfit)}
                      className={savedOutfits.includes(selectedOutfit) ? "text-red-500" : ""}
                    >
                      <Heart className={`h-5 w-5 ${savedOutfits.includes(selectedOutfit) ? "fill-red-500" : ""}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-medium">Occasion</h3>
                        <p className="text-muted-foreground">{outfitRecommendations[selectedOutfit].occasion}</p>
                      </div>

                      <div>
                        <h3 className="font-medium">Description</h3>
                        <p className="text-muted-foreground">{outfitRecommendations[selectedOutfit].description}</p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-medium mb-3">Items in this outfit</h3>
                        <Accordion type="single" collapsible className="w-full">
                          {outfitRecommendations[selectedOutfit].items.map((item, index) => {
                            const product = findProduct(item.name)

                            return (
                              <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="py-2">
                                  <div className="flex items-center">
                                    <span className="mr-2">{getCategoryIcon(item.category)}</span>
                                    {item.name}
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  {product ? (
                                    <div className="space-y-3">
                                      <div className="relative aspect-video overflow-hidden rounded-md">
                                        <Image
                                          src={product.images[0] || "/placeholder.svg"}
                                          alt={product.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <p className="text-sm">{product.description}</p>
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">${product.price.toFixed(2)}</span>
                                        <div className="space-x-2">
                                          <Button size="sm" variant="outline" asChild>
                                            <Link href={`/product/${product.slug}`}>View</Link>
                                          </Button>
                                          <Button size="sm">Add to Cart</Button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-muted-foreground">Product details not available</p>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            )
                          })}
                        </Accordion>
                      </div>
                    </div>

                    <div className="bg-muted/20 p-6 flex flex-col">
                      <h3 className="font-medium mb-4">Outfit Preview</h3>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        {outfitRecommendations[selectedOutfit].items.map((item, index) => (
                          <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                            <Image
                              src={findProductImage(item.name) || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                              <p className="text-xs text-white font-medium">{item.category}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 space-y-3">
                        <Button className="w-full gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Add All to Cart
                        </Button>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 gap-2">
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => toggleSaveOutfit(selectedOutfit)}
                          >
                            <Heart
                              className={`h-4 w-4 ${savedOutfits.includes(selectedOutfit) ? "fill-red-500 text-red-500" : ""}`}
                            />
                            {savedOutfits.includes(selectedOutfit) ? "Saved" : "Save"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Outfit list view
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {outfitRecommendations.map((outfit, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative aspect-video">
                      <Image
                        src={outfit.items[0] ? findProductImage(outfit.items[0].name) : "/placeholder.svg"}
                        alt={outfit.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-4 text-white">
                        <h3 className="font-semibold text-lg">{outfit.name}</h3>
                        <p className="text-sm text-white/80">For: {outfit.occasion}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50"
                        onClick={() => toggleSaveOutfit(index)}
                      >
                        <Heart className={`h-4 w-4 ${savedOutfits.includes(index) ? "fill-red-500" : ""}`} />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{outfit.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        {outfit.items.slice(0, 3).map((item, itemIndex) => (
                          <Badge key={itemIndex} variant="outline" className="flex items-center gap-1">
                            {getCategoryIcon(item.category)}
                            <span className="text-xs">{item.category}</span>
                          </Badge>
                        ))}
                        {outfit.items.length > 3 && <Badge variant="outline">+{outfit.items.length - 3} more</Badge>}
                      </div>
                      <Button className="w-full" onClick={() => setSelectedOutfit(index)}>
                        View Outfit Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

