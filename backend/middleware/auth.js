const jwt = require("jsonwebtoken")

// Middleware to authenticate user
const authenticateUser = (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    })
  }
}

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    })
  }
}

module.exports = { authenticateUser, isAdmin }

