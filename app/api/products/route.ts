import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/models/Product"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sort = searchParams.get("sort")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const featured = searchParams.get("featured")
    const isNew = searchParams.get("isNew")

    // Build filter object
    const filter: any = {}

    if (category) {
      filter.category = category
    }

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (minPrice !== null || maxPrice !== null) {
      filter.price = {}
      if (minPrice !== null) filter.price.$gte = Number(minPrice)
      if (maxPrice !== null) filter.price.$lte = Number(maxPrice)
    }

    if (featured === "true") {
      filter.isFeatured = true
    }

    if (isNew === "true") {
      filter.isNew = true
    }

    // Build sort object
    let sortOption: any = {}
    if (sort) {
      switch (sort) {
        case "price_asc":
          sortOption = { price: 1 }
          break
        case "price_desc":
          sortOption = { price: -1 }
          break
        case "newest":
          sortOption = { createdAt: -1 }
          break
        case "rating":
          sortOption = { rating: -1 }
          break
        default:
          sortOption = { createdAt: -1 }
      }
    } else {
      sortOption = { createdAt: -1 }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query
    const products = await Product.find(filter).sort(sortOption).skip(skip).limit(limit)

    // Get total count for pagination
    const total = await Product.countDocuments(filter)

    return NextResponse.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      products,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch products", error: (error as Error).message },
      { status: 500 },
    )
  }
}

