const express = require("express")
const Cart = require("../models/Cart")
const Product = require("../models/Product")
const { authenticateUser } = require("../middleware/auth")

const router = express.Router()

// Get user's cart
router.get("/", authenticateUser, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "name price images slug availableSizes colors",
    })

    if (!cart) {
      // Create empty cart if none exists
      cart = new Cart({
        user: req.user.id,
        items: [],
      })
      await cart.save()
    }

    res.status(200).json({
      success: true,
      cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: error.message,
    })
  }
})

// Add item to cart
router.post("/add", authenticateUser, async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body

    // Validate product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Find user's cart or create new one
    let cart = await Cart.findOne({ user: req.user.id })
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      })
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size && item.color === color,
    )

    if (itemIndex > -1) {
      // Update quantity if item exists
      cart.items[itemIndex].quantity += quantity
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        size,
        color,
      })
    }

    await cart.save()

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price images slug availableSizes colors",
    })

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message,
    })
  }
})

// Update cart item quantity
router.put("/update/:itemId", authenticateUser, async (req, res) => {
  try {
    const { quantity } = req.body

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      })
    }

    const cart = await Cart.findOne({ user: req.user.id })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === req.params.itemId)

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      })
    }

    cart.items[itemIndex].quantity = quantity
    await cart.save()

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price images slug availableSizes colors",
    })

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update cart",
      error: error.message,
    })
  }
})

// Remove item from cart
router.delete("/remove/:itemId", authenticateUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId)

    await cart.save()

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price images slug availableSizes colors",
    })

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    })
  }
})

// Clear cart
router.delete("/clear", authenticateUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    cart.items = []
    await cart.save()

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    })
  }
})

module.exports = router

