import mongoose, { Schema, type Document } from "mongoose"

export interface IProduct extends Document {
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
  isNew: boolean
  isFeatured: boolean
  availableSizes: string[]
  colors: { name: string; hex: string }[]
  material?: string
  stock: number
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true },
    fullDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    images: { type: [String], required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isNew: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    availableSizes: { type: [String], required: true },
    colors: [
      {
        name: String,
        hex: String,
      },
    ],
    material: String,
    stock: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)

