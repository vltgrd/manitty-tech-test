import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth0 } from './lib/auth0'

export async function middleware(request: NextRequest) {
  const response = await auth0.middleware(request)

  const session = await auth0.getSession(request)

  // If there is no session and the user is not already on an auth route, redirect to login
  if (!session && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(
      new URL(
        `/auth/login?returnTo=${encodeURIComponent(request.nextUrl.pathname)}`,
        request.url
      )
    )
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
}
