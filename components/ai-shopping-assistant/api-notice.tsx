"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ApiNotice() {
  return (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Demo Mode Active</AlertTitle>
      <AlertDescription>
        This AI assistant is running in demo mode with mock data since no OpenAI API key is available. In a production
        environment, you would connect to the OpenAI API for real AI-powered responses.
      </AlertDescription>
    </Alert>
  )
}

