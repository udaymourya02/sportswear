import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if using token-based auth
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle session expiration or auth errors
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token
      window.location.href = "/auth/login"
    }
    return Promise.reject(error)
  },
)

export default api

