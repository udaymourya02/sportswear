const express = require("express")
const Order = require("../models/Order")
const Cart = require("../models/Cart")
const Product = require("../models/Product")
const { authenticateUser, isAdmin } = require("../middleware/auth")

const router = express.Router()

// Create new order
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod, items, subtotal, tax, shipping, total } = req.body

    // Create order
    const order = new Order({
      user: req.user.id,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          date: Date.now(),
          note: "Order placed",
        },
      ],
    })

    await order.save()

    // Clear user's cart if order created from cart
    if (req.body.clearCart) {
      await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [] } })
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    })
  }
})

// Get all orders for a user
router.get("/my-orders", authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    })
  }
})

// Get order by ID
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if order belongs to user or user is admin
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this order",
      })
    }

    res.status(200).json({
      success: true,
      order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    })
  }
})

// Update order status (admin only)
router.put("/:id/status", authenticateUser, isAdmin, async (req, res) => {
  try {
    const { status, note } = req.body

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    order.status = status
    order.statusHistory.push({
      status,
      date: Date.now(),
      note: note || `Status updated to ${status}`,
    })

    if (status === "shipped" && req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber
    }

    await order.save()

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    })
  }
})

// Cancel order
router.put("/:id/cancel", authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if order belongs to user or user is admin
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      })
    }

    // Check if order can be cancelled
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled when status is ${order.status}`,
      })
    }

    order.status = "cancelled"
    order.statusHistory.push({
      status: "cancelled",
      date: Date.now(),
      note: req.body.note || "Order cancelled by user",
    })

    await order.save()

    res.status(200).json({
      success: true,
      message: "Order cancelled",
      order,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    })
  }
})

// Get all orders (admin only)
router.get("/", authenticateUser, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query

    // Build filter
    const filter = {}
    if (status) {
      filter.status = status
    }

    // Calculate pagination
    const pageNum = Number.parseInt(page)
    const limitNum = Number.parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("user", "firstName lastName email")

    const total = await Order.countDocuments(filter)

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    })
  }
})

module.exports = router

