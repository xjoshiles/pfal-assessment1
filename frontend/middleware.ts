import { NextRequest, NextResponse } from 'next/server'

export default async function middleware(req: NextRequest) {
  const sessionToken = req.cookies.get('sessionToken')?.value
  const url = req.nextUrl.clone()
  const isPublicRoute = ['/', '/register', '/login'].includes(url.pathname)

  // Redirect to /login if no sessionToken and the URL is a protected route
  if (!sessionToken && !isPublicRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to /dashboard if a sessionToken exists and trying to access
  // /register or /login routes. Note that the middleware will attempt to
  // validate the sessionToken during the redirect
  if (sessionToken && ['/register', '/login'].includes(url.pathname)) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // If there is a token, attempt to validate it
  if (sessionToken) {
    try {
      const validateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ADONIS_API}/auth/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${sessionToken}`,
        cache: 'no-store' // Ensures fresh data on every request
        },
      })

      // If the response is valid, allow access to protected route
      if (validateResponse.ok) {
        return NextResponse.next()
      }

      // If invalid token, clear the cookies and redirect to /login
      if (validateResponse.status === 401) {
        url.pathname = '/login'
        const response = NextResponse.redirect(url)
        response.cookies.set('sessionToken', '', { maxAge: 0 })
        response.cookies.set('userInfo', '', { maxAge: 0 })
        return response
      }

      // Else handle any other non-401 status codes (e.g., server errors)
      console.error('Unexpected status code from session validation:',
        validateResponse.status)
      url.pathname = '/login'
      return NextResponse.redirect(url)

    } catch (error) {
      // If the fetch fails (e.g., network issues, or the backend is down)
      console.error('Middleware token validation failed:', error)
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Allow accessing to public route with no sessionToken
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files served by Next.js)
     * - Any file with an extension (like .js, .css, .png, etc.)
     */
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ]
}
