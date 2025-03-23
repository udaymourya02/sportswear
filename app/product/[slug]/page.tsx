import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, Minus, Plus, Share2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddToCartButton from "@/components/add-to-cart-button"
import ProductGallery from "@/components/product-gallery"
import RelatedProducts from "@/components/related-products"
import ProductAIRecommendations from "@/components/product-ai-recommendations"
import { getProductBySlug, getRelatedProducts } from "@/lib/products"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.category, product.id)

  return (
    <div className="container py-10">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-foreground">
          {product.category}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Product Gallery */}
        <ProductGallery images={product.images} />

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
            {product.originalPrice && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-medium text-red-800">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          <p className="mt-4 text-muted-foreground">{product.description}</p>

          <div className="mt-6">
            <h3 className="font-medium">Select Size</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                <Button
                  key={size}
                  variant="outline"
                  className="h-10 w-10 rounded-md p-0"
                  disabled={!product.availableSizes.includes(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
            <Link href="/size-guide" className="mt-2 inline-block text-sm text-muted-foreground hover:text-foreground">
              Size Guide
            </Link>
          </div>

          <div className="mt-6">
            <h3 className="font-medium">Select Color</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <Button
                  key={color.name}
                  variant="outline"
                  className="relative h-10 w-10 rounded-full p-0 overflow-hidden"
                  style={{ backgroundColor: color.hex }}
                >
                  <span className="sr-only">{color.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium">Quantity</h3>
            <div className="mt-2 flex items-center">
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-l-md">
                <Minus className="h-4 w-4" />
                <span className="sr-only">Decrease quantity</span>
              </Button>
              <div className="flex h-10 w-12 items-center justify-center border-y">1</div>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-r-md">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Increase quantity</span>
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <AddToCartButton product={product} className="flex-1" />
            <Button variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Share</span>
            </Button>
          </div>

          <div className="mt-8 border-t pt-8">
            <Tabs defaultValue="description">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details & Care</TabsTrigger>
                <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="text-muted-foreground">{product.fullDescription || product.description}</p>
              </TabsContent>
              <TabsContent value="details" className="mt-4">
                <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                  <li>Material: {product.material || "Polyester blend"}</li>
                  <li>Moisture-wicking fabric keeps you dry and comfortable</li>
                  <li>Ergonomic seams reduce chafing and irritation</li>
                  <li>Machine washable, tumble dry low</li>
                  <li>Imported</li>
                </ul>
              </TabsContent>
              <TabsContent value="shipping" className="mt-4">
                <p className="text-muted-foreground">
                  Free standard shipping on orders over $50. Expedited and international shipping options available at
                  checkout.
                  <br />
                  <br />
                  Returns accepted within 30 days of delivery. Items must be unworn with original tags attached.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <ProductAIRecommendations product={product} />

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} />
    </div>
  )
}

