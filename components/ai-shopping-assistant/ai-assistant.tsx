"use client"

import { MessageSquare, ShoppingBag, Shirt } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAIAssistant } from "@/contexts/ai-assistant-context"
import { ChatInterface } from "./chat-interface"
import { PersonalizedRecommendations } from "./personalized-recommendations"
import { VirtualStylist } from "./virtual-stylist"
import { ApiNotice } from "./api-notice"

export function AIAssistant() {
  const { isOpen, mode, setMode } = useAIAssistant()

  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 w-full max-w-md">
      <Card className="shadow-xl border-2 h-[600px] animate-fade-in">
        <CardHeader className="p-3 border-b">
          <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
            <TabsList className="grid grid-cols-3 h-9">
              <TabsTrigger value="chat" className="text-xs">
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="text-xs">
                <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                For You
              </TabsTrigger>
              <TabsTrigger value="stylist" className="text-xs">
                <Shirt className="h-3.5 w-3.5 mr-1" />
                Stylist
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0 h-[calc(600px-57px)]">
          <div className="p-3">
            <ApiNotice />
          </div>
          <TabsContent value="chat" className="h-[calc(100%-56px)] m-0">
            <ChatInterface />
          </TabsContent>
          <TabsContent value="recommendations" className="h-[calc(100%-56px)] m-0">
            <PersonalizedRecommendations />
          </TabsContent>
          <TabsContent value="stylist" className="h-[calc(100%-56px)] m-0">
            <VirtualStylist />
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  )
}

