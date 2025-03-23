import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { mockProducts } from "./mock-data"

// Base prompt for the shopping assistant
const SHOPPING_ASSISTANT_PROMPT = `You are a helpful shopping assistant for SportsFit, a premium sportswear brand. 
Help customers find products, answer questions about sportswear, provide sizing advice, and assist with order tracking.
Be friendly, professional, and knowledgeable about athletic apparel and equipment.`

// Base prompt for the virtual stylist
const VIRTUAL_STYLIST_PROMPT = `You are a professional virtual stylist for SportsFit, a premium sportswear brand.
Provide fashion advice, outfit combinations, and styling tips for athletic and athleisure wear.
Consider body types, activities, seasons, and current fashion trends in your recommendations.`

export type ProductRecommendation = {
  id: string
  name: string
  reason: string
  confidence: number
}

export type OutfitRecommendation = {
  name: string
  items: {
    category: string
    name: string
    id: string
  }[]
  occasion: string
  description: string
}

// Check if OpenAI API key is available
const isOpenAIAvailable = () => {
  try {
    // In a real app, this would check for process.env.OPENAI_API_KEY
    // For this demo, we'll simulate that the API key is not available
    return false
  } catch (error) {
    return false
  }
}

// Mock chat responses for when API is not available
const mockChatResponses = [
  "I recommend checking out our Performance Running Jacket. It's perfect for outdoor running in various weather conditions.",
  "Our Pro Training Shorts are very popular for gym workouts. They're breathable and have a comfortable fit.",
  "For basketball, the Elite Basketball Shoes provide excellent ankle support and cushioning.",
  "The Compression Long Sleeve is great for recovery and provides muscle support during intense workouts.",
  "Based on your preferences, I think you'd like our Ultralight Running Shoes. They're designed for comfort during long-distance runs.",
]

export async function getChatResponse(
  userMessage: string,
  chatHistory: { role: "user" | "assistant"; content: string }[],
) {
  try {
    if (!isOpenAIAvailable()) {
      // Return a mock response if API is not available
      const randomIndex = Math.floor(Math.random() * mockChatResponses.length)
      return mockChatResponses[randomIndex]
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `${SHOPPING_ASSISTANT_PROMPT}\n\nChat History:\n${chatHistory
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n")}\n\nUser: ${userMessage}\n\nAssistant:`,
      temperature: 0.7,
      maxTokens: 500,
    })

    return text
  } catch (error) {
    console.error("Error getting chat response:", error)
    return "I'm sorry, I'm having trouble connecting right now. Please try again later."
  }
}

export async function getPersonalizedRecommendations(userPreferences: {
  recentlyViewed: string[]
  previousPurchases: string[]
  favoriteCategories: string[]
  userActivity: string
}): Promise<ProductRecommendation[]> {
  try {
    if (!isOpenAIAvailable()) {
      // Generate mock recommendations based on user preferences
      return generateMockRecommendations(userPreferences)
    }

    const prompt = `
      Based on the following user preferences and available products, recommend 4 products that this user would likely be interested in.
      Return your response as a JSON array of objects with id, name, reason, and confidence (a number between 0 and 1).
      
      User Preferences:
      - Recently viewed products: ${userPreferences.recentlyViewed.join(", ")}
      - Previous purchases: ${userPreferences.previousPurchases.join(", ")}
      - Favorite categories: ${userPreferences.favoriteCategories.join(", ")}
      - User activity: ${userPreferences.userActivity}
      
      Available Products:
      ${mockProducts.map((p) => `- ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: $${p.price}`).join("\n")}
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Parse the JSON response
    const recommendations = JSON.parse(text) as ProductRecommendation[]
    return recommendations
  } catch (error) {
    console.error("Error getting personalized recommendations:", error)
    // Return fallback recommendations
    return generateMockRecommendations(userPreferences)
  }
}

export async function getVirtualStylistRecommendations(userProfile: {
  gender: string
  bodyType: string
  preferences: string[]
  occasion: string
}): Promise<OutfitRecommendation[]> {
  try {
    if (!isOpenAIAvailable()) {
      // Generate mock outfit recommendations
      return generateMockOutfits(userProfile)
    }

    const prompt = `
      As a virtual stylist, create 2 outfit recommendations for a ${userProfile.gender} with a ${userProfile.bodyType} body type.
      The outfits should be suitable for ${userProfile.occasion} and match these preferences: ${userProfile.preferences.join(", ")}.
      
      Return your response as a JSON array of outfit objects, each with:
      - name: A catchy name for the outfit
      - items: An array of items (each with category, name, and a placeholder id)
      - occasion: What the outfit is best for
      - description: A brief styling description
      
      Make sure the outfits are fashionable, practical, and suitable for the specified occasion.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.8,
      maxTokens: 1000,
    })

    // Parse the JSON response
    const outfits = JSON.parse(text) as OutfitRecommendation[]
    return outfits
  } catch (error) {
    console.error("Error getting virtual stylist recommendations:", error)
    // Return fallback outfit recommendations
    return generateMockOutfits(userProfile)
  }
}

// Helper function to generate mock recommendations based on user preferences
function generateMockRecommendations(userPreferences: {
  recentlyViewed: string[]
  previousPurchases: string[]
  favoriteCategories: string[]
  userActivity: string
}): ProductRecommendation[] {
  // Filter products that match user preferences
  const filteredProducts = mockProducts.filter((product) => {
    // Match by category
    const categoryMatch = userPreferences.favoriteCategories.some(
      (category) => product.category.toLowerCase() === category.toLowerCase(),
    )

    // Match by activity (simple text matching)
    const activityMatch =
      userPreferences.userActivity.toLowerCase().includes("running") && product.category.toLowerCase() === "running"

    return categoryMatch || activityMatch
  })

  // If we don't have enough filtered products, add some featured products
  const productsToRecommend =
    filteredProducts.length >= 4
      ? filteredProducts.slice(0, 4)
      : [...filteredProducts, ...mockProducts.filter((p) => p.isFeatured)].slice(0, 4)

  // Generate reasons based on user preferences
  return productsToRecommend.map((product) => {
    let reason = `This ${product.category} product matches your preferences.`

    if (userPreferences.recentlyViewed.some((item) => product.name.includes(item))) {
      reason = "Based on products you recently viewed."
    } else if (userPreferences.favoriteCategories.includes(product.category)) {
      reason = `Matches your interest in ${product.category} products.`
    } else if (product.isNew) {
      reason = "New arrival that matches your style preferences."
    }

    return {
      id: product.id,
      name: product.name,
      reason,
      confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7 and 1.0
    }
  })
}

// Helper function to generate mock outfit recommendations
function generateMockOutfits(userProfile: {
  gender: string
  bodyType: string
  preferences: string[]
  occasion: string
}): OutfitRecommendation[] {
  const outfits: OutfitRecommendation[] = []

  // Workout outfit
  if (userProfile.occasion.toLowerCase().includes("gym") || userProfile.occasion.toLowerCase().includes("workout")) {
    outfits.push({
      name: "Essential Workout Combo",
      items: [
        { category: "Top", name: "Compression Long Sleeve", id: "4" },
        { category: "Bottom", name: "Pro Training Shorts", id: "2" },
        { category: "Footwear", name: "Elite Basketball Shoes", id: "3" },
      ],
      occasion: "Gym workout",
      description:
        "A comfortable and functional outfit for intense gym sessions. The compression top provides muscle support while the training shorts offer freedom of movement.",
    })
  }

  // Running outfit
  if (userProfile.occasion.toLowerCase().includes("running") || outfits.length < 2) {
    outfits.push({
      name: "Performance Runner",
      items: [
        { category: "Top", name: "Dri-Fit Training Tee", id: "7" },
        { category: "Bottom", name: "Performance Leggings", id: "6" },
        { category: "Outerwear", name: "Performance Running Jacket", id: "1" },
        { category: "Footwear", name: "Ultralight Running Shoes", id: "8" },
      ],
      occasion: "Running",
      description:
        "Perfect for outdoor runs in variable weather. The lightweight jacket provides protection while the moisture-wicking tee keeps you dry.",
    })
  }

  // Casual outfit
  if (userProfile.occasion.toLowerCase().includes("casual") || outfits.length < 2) {
    outfits.push({
      name: "Athleisure Casual",
      items: [
        { category: "Top", name: "Dri-Fit Training Tee", id: "7" },
        { category: "Bottom", name: "Pro Training Shorts", id: "2" },
        { category: "Footwear", name: "Ultralight Running Shoes", id: "8" },
      ],
      occasion: "Casual outing",
      description:
        "A stylish yet comfortable outfit for casual everyday wear. Combines performance fabrics with a relaxed aesthetic.",
    })
  }

  return outfits.slice(0, 2) // Return at most 2 outfits
}

