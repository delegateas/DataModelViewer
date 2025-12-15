import { auth } from './auth';
import { NextResponse } from 'next/server';
import { isPasswordAuthDisabled } from './lib/auth/entraid';

export default auth((req) => {
  const { auth: session } = req;
  const isLoggedIn = !!session?.user;
  const { pathname } = req.nextUrl;

  // Allow access to login page
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Allow access to auth API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Allow access to version API
  if (pathname === '/api/version') {
    return NextResponse.next();
  }

  // Check password auth session if EntraID is not used or if dual mode
  if (!isLoggedIn && !isPasswordAuthDisabled()) {
    // Check for password session
    const passwordSession = req.cookies.get('session');
    if (passwordSession) {
      // User has password session, allow access
      return NextResponse.next();
    }
  }

  // For API routes, return 401
  if (pathname.startsWith('/api')) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  // For page routes, redirect to login if not authenticated
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
    * Match all request paths except for the ones starting with:
    * - _next/static (static files)
    * - _next/image (image optimization files)
    * - favicon.ico (favicon file)
    * - public assets (images, SVGs, etc.)
    */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
