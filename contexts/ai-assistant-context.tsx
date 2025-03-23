"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getChatResponse, getPersonalizedRecommendations, getVirtualStylistRecommendations } from "@/lib/ai-service"
import type { ProductRecommendation, OutfitRecommendation } from "@/lib/ai-service"

type AssistantMode = "chat" | "stylist" | "recommendations"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type UserPreferences = {
  recentlyViewed: string[]
  previousPurchases: string[]
  favoriteCategories: string[]
  userActivity: string
}

type UserProfile = {
  gender: string
  bodyType: string
  preferences: string[]
  occasion: string
}

interface AIAssistantContextType {
  isOpen: boolean
  openAssistant: () => void
  closeAssistant: () => void
  messages: Message[]
  sendMessage: (message: string) => Promise<void>
  isLoading: boolean
  mode: AssistantMode
  setMode: (mode: AssistantMode) => void
  personalizedRecommendations: ProductRecommendation[]
  outfitRecommendations: OutfitRecommendation[]
  userPreferences: UserPreferences
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  userProfile: UserProfile
  updateUserProfile: (profile: Partial<UserProfile>) => void
  refreshRecommendations: () => Promise<void>
  refreshOutfits: () => Promise<void>
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined)

export function AIAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content: "Hi there! I'm your SportsFit shopping assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<AssistantMode>("chat")
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<ProductRecommendation[]>([])
  const [outfitRecommendations, setOutfitRecommendations] = useState<OutfitRecommendation[]>([])

  // Mock user preferences - in a real app, this would come from a user profile or be built over time
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    recentlyViewed: ["Performance Running Jacket", "Pro Training Shorts"],
    previousPurchases: ["Compression Long Sleeve"],
    favoriteCategories: ["Running", "Training"],
    userActivity: "Running and gym workouts 3-4 times per week",
  })

  // Mock user profile for virtual stylist
  const [userProfile, setUserProfile] = useState<UserProfile>({
    gender: "Male",
    bodyType: "Athletic",
    preferences: ["Comfortable", "Performance", "Modern"],
    occasion: "Gym workout",
  })

  const openAssistant = () => setIsOpen(true)
  const closeAssistant = () => setIsOpen(false)

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Format the chat history for the AI
      const chatHistory = messages
        .filter((msg) => msg.id !== "welcome-message")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

      const response = await getChatResponse(content, chatHistory)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    setUserPreferences((prev) => ({ ...prev, ...preferences }))
  }

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }))
  }

  const refreshRecommendations = async () => {
    setIsLoading(true)
    try {
      const recommendations = await getPersonalizedRecommendations(userPreferences)
      setPersonalizedRecommendations(recommendations)
    } catch (error) {
      console.error("Error refreshing recommendations:", error)
      // Set empty recommendations if there's an error
      setPersonalizedRecommendations([])
    } finally {
      setIsLoading(false)
    }
  }

  const refreshOutfits = async () => {
    setIsLoading(true)
    try {
      const outfits = await getVirtualStylistRecommendations(userProfile)
      setOutfitRecommendations(outfits)
    } catch (error) {
      console.error("Error refreshing outfit recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize recommendations on first load
  useEffect(() => {
    refreshRecommendations()
    refreshOutfits()
  }, [])

  return (
    <AIAssistantContext.Provider
      value={{
        isOpen,
        openAssistant,
        closeAssistant,
        messages,
        sendMessage,
        isLoading,
        mode,
        setMode,
        personalizedRecommendations,
        outfitRecommendations,
        userPreferences,
        updateUserPreferences,
        userProfile,
        updateUserProfile,
        refreshRecommendations,
        refreshOutfits,
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  )
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext)
  if (context === undefined) {
    throw new Error("useAIAssistant must be used within an AIAssistantProvider")
  }
  return context
}

