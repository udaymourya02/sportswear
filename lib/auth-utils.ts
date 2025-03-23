import { cookies } from "next/headers"
import { jwtVerify } from "jose"

export async function getServerSession() {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    return null
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "")
    const { payload } = await jwtVerify(token, secret)

    return {
      user: {
        id: payload.id,
        role: payload.role,
      },
    }
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}

export async function isAuthenticated() {
  const session = await getServerSession()
  return !!session
}

export async function isAdmin() {
  const session = await getServerSession()
  return session?.user?.role === "admin"
}

