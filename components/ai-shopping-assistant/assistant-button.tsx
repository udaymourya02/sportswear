"use client"

import { Bot, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAIAssistant } from "@/contexts/ai-assistant-context"

export function AssistantButton() {
  const { isOpen, openAssistant, closeAssistant } = useAIAssistant()

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={isOpen ? closeAssistant : openAssistant}
        size="lg"
        className={`rounded-full w-14 h-14 shadow-lg transition-all duration-300 ${
          isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-brand-primary hover:bg-brand-primary/90"
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6 animate-pulse" />}
        <span className="sr-only">{isOpen ? "Close" : "Open"} AI Shopping Assistant</span>
      </Button>
    </div>
  )
}

