import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import ProductCard from "@/components/product-card"
import { getProductsByCategory, getCategoryBySlug } from "@/lib/products"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug)

  if (!category) {
    notFound()
  }

  const products = await getProductsByCategory(params.slug)

  return (
    <div className="container py-10">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Filters</h3>
            <Button variant="outline" size="sm" className="mr-2">
              Reset
            </Button>
            <Button size="sm">Apply</Button>
          </div>

          <div className="border-t pt-6">
            <h4 className="mb-4 text-sm font-semibold">Price Range</h4>
            <Slider defaultValue={[0, 100]} max={200} step={1} />
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>$0</span>
              <span>$200+</span>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="mb-4 text-sm font-semibold">Size</h4>
            <div className="space-y-2">
              {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox id={`size-${size}`} />
                  <label
                    htmlFor={`size-${size}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {size}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="mb-4 text-sm font-semibold">Color</h4>
            <div className="space-y-2">
              {["Black", "White", "Gray", "Red", "Blue", "Green"].map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox id={`color-${color}`} />
                  <label
                    htmlFor={`color-${color}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {color}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold">{category.name}</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{products.length} products</span>
              <select className="rounded-md border p-2 text-sm">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
                <option>Best Selling</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

