export interface Product {
  id: string
  name: string
  slug: string
  description: string
  fullDescription?: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  subcategory?: string
  rating: number
  reviewCount: number
  isNew?: boolean
  isFeatured?: boolean
  availableSizes: string[]
  colors: { name: string; hex: string }[]
  material?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  size: string
  color: string
  image: string
}

