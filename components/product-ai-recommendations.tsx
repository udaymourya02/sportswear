"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Bot, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAIAssistant } from "@/contexts/ai-assistant-context"
import { mockProducts } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

interface ProductAIRecommendationsProps {
  product: Product
}

export default function ProductAIRecommendations({ product }: ProductAIRecommendationsProps) {
  const { personalizedRecommendations, outfitRecommendations } = useAIAssistant()
  const [activeTab, setActiveTab] = useState("similar")

  // Find similar products based on category
  const similarProducts = mockProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  // Find outfit that contains this product or similar products
  const matchingOutfit = outfitRecommendations.find((outfit) =>
    outfit.items.some(
      (item) =>
        item.name.toLowerCase().includes(product.name.toLowerCase().split(" ")[0]) ||
        product.name.toLowerCase().includes(item.name.toLowerCase().split(" ")[0]),
    ),
  )

  // Find a product image based on name (simplified for demo)
  const findProductImage = (name: string) => {
    const product = mockProducts.find((p) => p.name.toLowerCase().includes(name.toLowerCase().split(" ")[0]))
    return product?.images[0] || "/placeholder.svg"
  }

  return (
    <Card className="mt-8">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Recommendations</CardTitle>
              <CardDescription>Personalized suggestions based on this product</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/ai-assistant">Ask AI Assistant</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="similar" onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="similar"
              className={`rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
            >
              Similar Products
            </TabsTrigger>
            <TabsTrigger
              value="outfit"
              className={`rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
            >
              Complete the Outfit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="similar" className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarProducts.map((similarProduct) => (
                <Link key={similarProduct.id} href={`/product/${similarProduct.slug}`} className="group">
                  <div className="relative aspect-square overflow-hidden rounded-md">
                    <Image
                      src={similarProduct.images[0] || "/placeholder.svg"}
                      alt={similarProduct.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="mt-2 text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {similarProduct.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">${similarProduct.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="outfit" className="p-4">
            {matchingOutfit ? (
              <div>
                <div className="flex items-center mb-3">
                  <Sparkles className="h-4 w-4 mr-1.5 text-brand-primary" />
                  <h3 className="font-medium">{matchingOutfit.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{matchingOutfit.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {matchingOutfit.items.map((item, index) => (
                    <div key={index} className="group">
                      <div className="relative aspect-square overflow-hidden rounded-md">
                        <Image
                          src={findProductImage(item.name) || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-white border-white hover:bg-white/20 hover:text-white"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                      <h4 className="mt-2 text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/virtual-stylist">
                      See more outfits <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No outfit recommendations available for this product.</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href="/virtual-stylist">Try our Virtual Stylist</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

