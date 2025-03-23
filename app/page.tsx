import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import AIFeaturesShowcase from "@/components/ai-features-showcase"
import { getFeaturedProducts } from "@/lib/products"

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="flex flex-col gap-12 pb-8">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Hero image of athletes wearing SportsFit clothing"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Elevate Your Performance</h1>
          <p className="mt-6 max-w-lg text-lg">
            Premium sportswear designed for athletes who demand the best in comfort, performance, and style.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/category/men">Shop Men</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full bg-transparent text-white hover:bg-white hover:text-black"
            >
              <Link href="/category/women">Shop Women</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Features Showcase */}
      <AIFeaturesShowcase />

      {/* Categories Section */}
      <section className="container">
        <h2 className="mb-8 text-3xl font-bold tracking-tight">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { name: "Running", image: "/placeholder.svg?height=600&width=600", href: "/category/running" },
            { name: "Training", image: "/placeholder.svg?height=600&width=600", href: "/category/training" },
            { name: "Basketball", image: "/placeholder.svg?height=600&width=600", href: "/category/basketball" },
            { name: "Soccer", image: "/placeholder.svg?height=600&width=600", href: "/category/soccer" },
          ].map((category) => (
            <Link key={category.name} href={category.href} className="group relative overflow-hidden rounded-lg">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                width={600}
                height={600}
                className="aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-xl font-semibold text-white">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
          <Button asChild variant="ghost" className="gap-1">
            <Link href="/products">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promotion Section */}
      <section className="bg-muted py-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">New Collection: Performance Elite</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Engineered for athletes who push boundaries. Our latest collection combines cutting-edge technology with
                sustainable materials.
              </p>
              <Button asChild className="mt-6 rounded-full">
                <Link href="/collections/performance-elite">Explore Collection</Link>
              </Button>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg md:aspect-square">
              <Image
                src="/placeholder.svg?height=800&width=800"
                alt="Performance Elite Collection"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">Why Choose SportsFit</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: "Premium Quality",
              description: "Crafted from the finest materials for durability and comfort during intense workouts.",
            },
            {
              title: "Performance Focused",
              description: "Engineered to enhance athletic performance with moisture-wicking and breathable fabrics.",
            },
            {
              title: "Sustainable Approach",
              description: "Committed to eco-friendly practices with recycled materials and ethical manufacturing.",
            },
          ].map((feature, index) => (
            <div key={index} className="rounded-lg border bg-card p-6 text-card-foreground shadow">
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

