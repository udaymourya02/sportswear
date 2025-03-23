import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const isApiRoute = request.nextUrl.pathname.startsWith("/api")
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/account") || request.nextUrl.pathname.startsWith("/checkout")

  // If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // If accessing auth pages with a token, redirect to home
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // For API routes, let the API handle authentication
  if (isApiRoute) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/auth/:path*", "/api/:path*"],
}

