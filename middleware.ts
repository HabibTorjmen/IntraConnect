import { type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register']
  
  const pathname = request.nextUrl.pathname
  
  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return
  }
  
  // For other routes, authentication is handled by the client context
  return
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
