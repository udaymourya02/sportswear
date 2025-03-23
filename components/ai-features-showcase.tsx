import { Bot, Sparkles, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AIFeaturesShowcase() {
  return (
    <section className="bg-gradient-to-b from-brand-primary/5 to-background py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
              AI-Powered Shopping
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of sportswear shopping with our intelligent AI assistant, personalized
            recommendations, and virtual stylist.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover-lift">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI Shopping Assistant</h3>
            <p className="mt-2 text-muted-foreground">
              Get instant answers about products, sizing, materials, and more with our intelligent chatbot.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center">
                <span className="mr-2 text-brand-primary">✓</span>
                Product recommendations
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-brand-primary">✓</span>
                Order tracking assistance
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-brand-primary">✓</span>
                Voice-enabled interaction
              </li>
            </ul>
            <Button className="mt-6 w-full" variant="outline">
              Try the Assistant
            </Button>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover-lift">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <Brain className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold">Personalized Shopping</h3>
            <p className="mt-2 text-muted-foreground">
              Discover products tailored to your preferences, browsing history, and previous purchases.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center">
                <span className="mr-2 text-brand-secondary">✓</span>
                Smart product recommendations
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-brand-secondary">✓</span>
                Preference learning
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-brand-secondary">✓</span>
                Personalized deals
              </li>
            </ul>
            <Button className="mt-6 w-full" variant="outline">
              View Recommendations
            </Button>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover-lift">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Virtual Stylist</h3>
            <p className="mt-2 text-muted-foreground">
              Get outfit recommendations based on your body type, preferences, and the latest fashion trends.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center">
                <span className="mr-2 text-brand-accent">✓</span>
                Complete outfit suggestions
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-brand-accent">✓</span>
                Occasion-based styling
              </li>
              <li className="flex items-center">
                <span className="mr-2 text-brand-accent">✓</span>
                Body type optimization
              </li>
            </ul>
            <Button className="mt-6 w-full" variant="outline">
              Try Virtual Stylist
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

