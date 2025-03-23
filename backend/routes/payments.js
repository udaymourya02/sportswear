const express = require("express")
const Razorpay = require("razorpay")
const crypto = require("crypto")
const Order = require("../models/Order")
const { authenticateUser } = require("../middleware/auth")

const router = express.Router()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Create Razorpay order
router.post("/create-order", authenticateUser, async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      payment_capture: 1, // Auto-capture payment
    }

    const razorpayOrder = await razorpay.orders.create(options)

    res.status(200).json({
      success: true,
      order: razorpayOrder,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    })
  }
})

// Verify Razorpay payment
router.post("/verify", authenticateUser, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      })
    }

    // Update order with payment details
    if (orderId) {
      const order = await Order.findById(orderId)

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        })
      }

      order.paymentResult = {
        id: razorpay_payment_id,
        status: "completed",
        update_time: Date.now(),
        email_address: req.body.email || "",
      }

      order.status = "processing"
      order.statusHistory.push({
        status: "processing",
        date: Date.now(),
        note: "Payment received",
      })

      await order.save()
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    })
  }
})

// Get payment details
router.get("/:paymentId", authenticateUser, async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId)

    res.status(200).json({
      success: true,
      payment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message,
    })
  }
})

// Refund payment (admin only)
router.post("/refund", authenticateUser, async (req, res) => {
  try {
    const { paymentId, amount, notes } = req.body

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined, // Optional partial refund
      notes,
    })

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      refund,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to refund payment",
      error: error.message,
    })
  }
})

module.exports = router

