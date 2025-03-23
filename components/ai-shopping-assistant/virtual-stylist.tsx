"use client"
import Image from "next/image"
import Link from "next/link"
import { RefreshCw, Sparkles, Shirt, PinIcon as PantsIcon, Footprints } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAIAssistant } from "@/contexts/ai-assistant-context"
import { mockProducts } from "@/lib/mock-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function VirtualStylist() {
  const { outfitRecommendations, refreshOutfits, isLoading, userProfile, updateUserProfile } = useAIAssistant()

  const handleOccasionChange = (value: string) => {
    updateUserProfile({ occasion: value })
  }

  const handleGenderChange = (value: string) => {
    updateUserProfile({ gender: value })
  }

  const handleBodyTypeChange = (value: string) => {
    updateUserProfile({ bodyType: value })
  }

  // Find a product image based on name (simplified for demo)
  const findProductImage = (name: string) => {
    const product = mockProducts.find((p) => p.name.toLowerCase().includes(name.toLowerCase().split(" ")[0]))
    return product?.images[0] || "/placeholder.svg"
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

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h3 className="font-semibold mb-3">Virtual Stylist</h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="space-y-1">
            <Label htmlFor="gender" className="text-xs">
              Gender
            </Label>
            <Select value={userProfile.gender} onValueChange={handleGenderChange}>
              <SelectTrigger id="gender" className="h-8">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Non-binary">Non-binary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="bodyType" className="text-xs">
              Body Type
            </Label>
            <Select value={userProfile.bodyType} onValueChange={handleBodyTypeChange}>
              <SelectTrigger id="bodyType" className="h-8">
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
        </div>

        <div className="space-y-1">
          <Label htmlFor="occasion" className="text-xs">
            Occasion
          </Label>
          <Select value={userProfile.occasion} onValueChange={handleOccasionChange}>
            <SelectTrigger id="occasion" className="h-8">
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

        <div className="flex justify-end mt-3">
          <Button variant="outline" size="sm" onClick={refreshOutfits} disabled={isLoading} className="h-8">
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Outfits
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {outfitRecommendations.length === 0 && isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Creating outfit recommendations...</p>
            </div>
          ) : outfitRecommendations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No outfit recommendations available.</p>
              <Button variant="outline" size="sm" onClick={refreshOutfits} className="mt-2">
                Generate Outfits
              </Button>
            </div>
          ) : (
            outfitRecommendations.map((outfit, index) => (
              <div key={index} className="border rounded-lg overflow-hidden bg-card transition-all hover:shadow-md">
                <div className="p-3 border-b bg-muted/50">
                  <h4 className="font-medium flex items-center">
                    <Sparkles className="h-4 w-4 mr-1.5 text-brand-primary" />
                    {outfit.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">Perfect for: {outfit.occasion}</p>
                </div>

                <div className="p-3">
                  <p className="text-sm text-muted-foreground mb-3">{outfit.description}</p>

                  <div className="space-y-2">
                    {outfit.items.map((item, itemIndex) => {
                      const productImage = findProductImage(item.name)

                      return (
                        <div key={itemIndex} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                          <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={productImage || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <span className="text-xs font-medium text-muted-foreground flex items-center mr-2">
                                {getCategoryIcon(item.category)}
                                <span className="ml-1">{item.category}</span>
                              </span>
                            </div>
                            <p className="font-medium text-sm truncate">{item.name}</p>
                          </div>
                          <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                            <Link href={`/product/${item.id}`}>View</Link>
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="p-3 border-t bg-muted/30 flex justify-between">
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Save Outfit
                  </Button>
                  <Button size="sm" className="h-7 text-xs">
                    Add All to Cart
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

