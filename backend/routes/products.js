const express = require("express")
const Product = require("../models/Product")
const { authenticateUser, isAdmin } = require("../middleware/auth")

const router = express.Router()

// Get all products with filtering, sorting, and pagination
router.get("/", async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12, featured, isNew } = req.query

    // Build filter object
    const filter = {}

    if (category) {
      filter.category = category
    }

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {}
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice)
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice)
    }

    if (featured === "true") {
      filter.isFeatured = true
    }

    if (isNew === "true") {
      filter.isNew = true
    }

    // Build sort object
    let sortOption = {}
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
    const pageNum = Number.parseInt(page)
    const limitNum = Number.parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // Execute query
    const products = await Product.find(filter).sort(sortOption).skip(skip).limit(limitNum)

    // Get total count for pagination
    const total = await Product.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    })
  }
})

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.status(200).json({
      success: true,
      product,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    })
  }
})

// Get product by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.status(200).json({
      success: true,
      product,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    })
  }
})

// Create new product (admin only)
router.post("/", authenticateUser, isAdmin, async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    })
  }
})

// Update product (admin only)
router.put("/:id", authenticateUser, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    })
  }
})

// Delete product (admin only)
router.delete("/:id", authenticateUser, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    })
  }
})

// Get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category })

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    })
  }
})

// Get featured products
router.get("/featured/list", async (req, res) => {
  try {
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 8
    const products = await Product.find({ isFeatured: true }).limit(limit)

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
      error: error.message,
    })
  }
})

// Get new arrivals
router.get("/new/arrivals", async (req, res) => {
  try {
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 8
    const products = await Product.find({ isNew: true }).limit(limit)

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch new arrivals",
      error: error.message,
    })
  }
})

// Get related products
router.get("/:id/related", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 4
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
    }).limit(limit)

    res.status(200).json({
      success: true,
      count: relatedProducts.length,
      products: relatedProducts,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch related products",
      error: error.message,
    })
  }
})

module.exports = router

