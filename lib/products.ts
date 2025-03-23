import { mockProducts, mockCategories } from "./mock-data"
import type { Product, Category } from "./types"

// In a real application, these functions would fetch data from an API or database
export async function getFeaturedProducts(): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockProducts.filter((product) => product.isFeatured)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockProducts.find((product) => product.slug === slug) || null
}

export async function getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockProducts.filter((product) => product.category === category && product.id !== excludeId).slice(0, 4)
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Find the category by slug
  const category = mockCategories.find((cat) => cat.slug === categorySlug)

  if (!category) {
    return []
  }

  // Return products that match the category name
  return mockProducts.filter(
    (product) =>
      product.category === category.name ||
      (categorySlug === "men" && ["Men", "Training", "Running", "Basketball", "Soccer"].includes(product.category)) ||
      (categorySlug === "women" && ["Women", "Training", "Running"].includes(product.category)),
  )
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockCategories.find((category) => category.slug === slug) || null
}

