"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      className="product-card group relative overflow-hidden rounded-lg border bg-background"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="product-image object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          priority={product.isFeatured}
        />
        {product.isNew && (
          <motion.div
            className="absolute left-4 top-4 z-10 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            New
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Heart className="h-5 w-5" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      <div className="p-4">
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="line-clamp-1 text-lg font-medium transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{product.category}</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            {product.rating && (
              <div className="flex items-center text-sm">
                <span className="mr-1 text-yellow-500">★</span>
                <span>{product.rating}</span>
              </div>
            )}
          </div>
        </Link>
        <motion.div
          className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ y: 10, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          <Button size="sm" className="w-full btn-hover-slide">
            Add to Cart
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

