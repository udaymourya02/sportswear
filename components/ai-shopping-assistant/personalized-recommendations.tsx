"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { RefreshCw, ThumbsUp, ThumbsDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAIAssistant } from "@/contexts/ai-assistant-context"
import { mockProducts } from "@/lib/mock-data"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function PersonalizedRecommendations() {
  const { personalizedRecommendations, refreshRecommendations, isLoading } = useAIAssistant()
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "like" | "dislike" | null>>({})

  const handleFeedback = (productId: string, type: "like" | "dislike") => {
    setFeedbackGiven((prev) => ({ ...prev, [productId]: type }))
    // In a real app, this would send feedback to the recommendation system
  }

  // Find the full product details from our mock data
  const getProductDetails = (productId: string) => {
    return mockProducts.find((p) => p.id === productId) || null
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex justify-between items-center">
        <h3 className="font-semibold">Personalized For You</h3>
        <Button variant="ghost" size="sm" onClick={refreshRecommendations} disabled={isLoading} className="h-8 px-2">
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {personalizedRecommendations.length === 0 && isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Generating recommendations...</p>
            </div>
          ) : personalizedRecommendations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recommendations available.</p>
              <Button variant="outline" size="sm" onClick={refreshRecommendations} className="mt-2">
                Generate Recommendations
              </Button>
            </div>
          ) : (
            personalizedRecommendations.map((recommendation) => {
              const product = getProductDetails(recommendation.id)
              if (!product) return null

              return (
                <div
                  key={recommendation.id}
                  className="border rounded-lg overflow-hidden bg-card transition-all hover:shadow-md"
                >
                  <Link href={`/product/${product.slug}`}>
                    <div className="aspect-square relative">
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <Link href={`/product/${product.slug}`}>
                        <h4 className="font-medium line-clamp-1 hover:text-primary transition-colors">
                          {product.name}
                        </h4>
                      </Link>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Info className="h-4 w-4" />
                              <span className="sr-only">Why recommended</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p className="max-w-xs">{recommendation.reason}</p>
                            <p className="text-xs mt-1">Confidence: {Math.round(recommendation.confidence * 100)}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold">${product.price.toFixed(2)}</span>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 rounded-full ${
                            feedbackGiven[recommendation.id] === "like" ? "bg-green-100 text-green-600" : ""
                          }`}
                          onClick={() => handleFeedback(recommendation.id, "like")}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span className="sr-only">Like</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 rounded-full ${
                            feedbackGiven[recommendation.id] === "dislike" ? "bg-red-100 text-red-600" : ""
                          }`}
                          onClick={() => handleFeedback(recommendation.id, "dislike")}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          <span className="sr-only">Dislike</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

