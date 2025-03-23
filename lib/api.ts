import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
})

// Auth API
export const authAPI = {
  register: async (userData: any) => {
    const response = await api.post("/auth/register", userData)
    return response.data
  },

  login: async (credentials: any) => {
    const response = await api.post("/auth/login", credentials)
    return response.data
  },

  logout: async () => {
    const response = await api.post("/auth/logout")
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me")
    return response.data
  },
}

// Products API
export const productsAPI = {
  getProducts: async (params: any = {}) => {
    const response = await api.get("/products", { params })
    return response.data
  },

  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  getProductBySlug: async (slug: string) => {
    const response = await api.get(`/products/slug/${slug}`)
    return response.data
  },

  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get("/products/featured/list", { params: { limit } })
    return response.data
  },

  getNewArrivals: async (limit = 8) => {
    const response = await api.get("/products/new/arrivals", { params: { limit } })
    return response.data
  },

  getRelatedProducts: async (productId: string, limit = 4) => {
    const response = await api.get(`/products/${productId}/related`, { params: { limit } })
    return response.data
  },

  getProductsByCategory: async (category: string) => {
    const response = await api.get(`/products/category/${category}`)
    return response.data
  },
}

// Cart API
export const cartAPI = {
  getCart: async () => {
    const response = await api.get("/cart")
    return response.data
  },

  addToCart: async (item: any) => {
    const response = await api.post("/cart/add", item)
    return response.data
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    const response = await api.put(`/cart/update/${itemId}`, { quantity })
    return response.data
  },

  removeCartItem: async (itemId: string) => {
    const response = await api.delete(`/cart/remove/${itemId}`)
    return response.data
  },

  clearCart: async () => {
    const response = await api.delete("/cart/clear")
    return response.data
  },
}

// Orders API
export const ordersAPI = {
  createOrder: async (orderData: any) => {
    const response = await api.post("/orders", orderData)
    return response.data
  },

  getMyOrders: async () => {
    const response = await api.get("/orders/my-orders")
    return response.data
  },

  getOrderById: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`)
    return response.data
  },

  cancelOrder: async (orderId: string, note?: string) => {
    const response = await api.put(`/orders/${orderId}/cancel`, { note })
    return response.data
  },
}

// Payments API
export const paymentsAPI = {
  createRazorpayOrder: async (amount: number, receipt: string) => {
    const response = await api.post("/payments/create-order", { amount, receipt })
    return response.data
  },

  verifyPayment: async (paymentData: any) => {
    const response = await api.post("/payments/verify", paymentData)
    return response.data
  },
}

// User API
export const userAPI = {
  updateProfile: async (userData: any) => {
    const response = await api.put("/users/profile", userData)
    return response.data
  },

  addAddress: async (addressData: any) => {
    const response = await api.post("/users/address", addressData)
    return response.data
  },

  deleteAddress: async (addressId: string) => {
    const response = await api.delete(`/users/address/${addressId}`)
    return response.data
  },

  updatePreferences: async (preferences: any) => {
    const response = await api.put("/users/preferences", preferences)
    return response.data
  },

  addToRecentlyViewed: async (productData: any) => {
    const response = await api.post("/users/recently-viewed", productData)
    return response.data
  },
}

export default api

