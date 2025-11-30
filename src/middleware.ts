import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/editor', '/subscription', '/profile'];
  const authPaths = ['/sign-in', '/sign-up'];
  
  const { pathname } = request.nextUrl;
  
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  // Get session token from cookies
  const sessionToken = request.cookies.get('session')?.value;
  const hasSession = !!sessionToken;
  
  // If user has session and trying to access auth pages, redirect to dashboard
  if (hasSession && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If user has no session and trying to access protected pages, redirect to sign-in
  if (!hasSession && isProtectedPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.svg (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.svg).*)',
  ],
};
