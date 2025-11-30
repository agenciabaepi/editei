import { NextRequest, NextResponse } from 'next/server';

// TEMPORARILY DISABLED: Testing if middleware is causing 404 on root path
// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/editor/:path*',
//     '/subscription/:path*',
//     '/profile/:path*',
//     '/sign-in/:path*',
//     '/sign-up/:path*',
//     '/admin/:path*',
//   ],
// };

export async function middleware(request: NextRequest) {
  // TEMPORARILY DISABLED: Just pass through everything
  return NextResponse.next();
  
  // Original middleware code (commented out for testing)
  // const protectedPaths = ['/dashboard', '/editor', '/subscription', '/profile'];
  // const authPaths = ['/sign-in', '/sign-up'];
  // const { pathname } = request.nextUrl;
  // const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  // const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  // const sessionToken = request.cookies.get('session')?.value;
  // const hasSession = !!sessionToken;
  // if (hasSession && isAuthPath) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }
  // if (!hasSession && isProtectedPath) {
  //   return NextResponse.redirect(new URL('/sign-in', request.url));
  // }
  // return NextResponse.next();
}
