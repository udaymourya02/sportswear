const express = require("express")
const User = require("../models/User")
const { authenticateUser, isAdmin } = require("../middleware/auth")

const router = express.Router()

// Update user profile
router.put("/profile", authenticateUser, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update basic info
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (email) user.email = email

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    })
  }
})

// Add/update address
router.post("/address", authenticateUser, async (req, res) => {
  try {
    const { type, street, city, state, zipCode, country, isDefault } = req.body

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Create new address object
    const newAddress = {
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false,
    }

    // Check if address with this type already exists
    const addressIndex = user.addresses.findIndex((addr) => addr.type === type)

    if (addressIndex > -1) {
      // Update existing address
      user.addresses[addressIndex] = newAddress
    } else {
      // Add new address
      user.addresses.push(newAddress)
    }

    // If this address is set as default, unset default for other addresses of same type
    if (newAddress.isDefault) {
      user.addresses.forEach((addr, index) => {
        if (addr.type === type && index !== addressIndex) {
          addr.isDefault = false
        }
      })
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: "Address saved successfully",
      addresses: user.addresses,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save address",
      error: error.message,
    })
  }
})

// Delete address
router.delete("/address/:addressId", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.addressId)

    await user.save()

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete address",
      error: error.message,
    })
  }
})

// Update user preferences
router.put("/preferences", authenticateUser, async (req, res) => {
  try {
    const { favoriteCategories, bodyType, gender, activityLevel } = req.body

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update preferences
    if (favoriteCategories) user.preferences.favoriteCategories = favoriteCategories
    if (bodyType) user.preferences.bodyType = bodyType
    if (gender) user.preferences.gender = gender
    if (activityLevel) user.preferences.activityLevel = activityLevel

    await user.save()

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: user.preferences,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update preferences",
      error: error.message,
    })
  }
})

// Add product to recently viewed
router.post("/recently-viewed", authenticateUser, async (req, res) => {
  try {
    const { productId, name } = req.body

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Remove if already exists
    user.preferences.recentlyViewed = user.preferences.recentlyViewed.filter(
      (item) => item.productId.toString() !== productId,
    )

    // Add to beginning of array
    user.preferences.recentlyViewed.unshift({
      productId,
      name,
      viewedAt: Date.now(),
    })

    // Limit to 10 items
    if (user.preferences.recentlyViewed.length > 10) {
      user.preferences.recentlyViewed = user.preferences.recentlyViewed.slice(0, 10)
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: "Recently viewed updated",
      recentlyViewed: user.preferences.recentlyViewed,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update recently viewed",
      error: error.message,
    })
  }
})

// Get all users (admin only)
router.get("/", authenticateUser, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    // Calculate pagination
    const pageNum = Number.parseInt(page)
    const limitNum = Number.parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const users = await User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limitNum)

    const total = await User.countDocuments()

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    })
  }
})

module.exports = router

