import { NextRequest, NextResponse } from "next/server"

const protectedRoutes = ["/dashboard"]
const authRoutes = ["/login", "/signup"]

const isProd = process.env.NODE_ENV === "production"

function getSessionCookie(request: NextRequest): string | undefined {
  const read = (name: string) => request.cookies.get(name)?.value

  // Convex BetterAuth JWT cookie (primary). With useSecureCookies enabled the
  // name is prefixed with __Secure-.
  const jwtCookie = read("convex_jwt") ?? read("__Secure-convex_jwt")
  if (jwtCookie) return jwtCookie

  // BetterAuth session cookie (fallback)
  const betterAuthCookie =
    read("better-auth.session_token") ??
    read("__Secure-better-auth.session_token")
  if (betterAuthCookie) return betterAuthCookie

  return undefined
}

function buildCsp(nonce: string): string {
  const connectOrigins = new Set<string>(["'self'"])

  // Enumerate the Convex API and site origins (with their websocket
  // counterparts) instead of allowing any https/wss origin.
  const addOrigin = (value: string | undefined) => {
    if (!value) return
    try {
      const { protocol, host } = new URL(value)
      connectOrigins.add(`${protocol}//${host}`)
      if (protocol === "https:") connectOrigins.add(`wss://${host}`)
    } catch {
      // Ignore malformed env values.
    }
  }
  addOrigin(process.env.NEXT_PUBLIC_CONVEX_URL)
  addOrigin(process.env.NEXT_PUBLIC_CONVEX_SITE_URL)

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    `connect-src ${[...connectOrigins].join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ")
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = getSessionCookie(request)

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !sessionToken) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && sessionToken) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  if (isProd) {
    // Per-request nonce. Next.js automatically applies it to the inline
    // scripts/styles it renders when the `x-nonce` request header is present.
    const nonce = crypto.randomUUID()
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-nonce", nonce)

    const response = NextResponse.next({ request: { headers: requestHeaders } })
    response.headers.set("Content-Security-Policy", buildCsp(nonce))
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
