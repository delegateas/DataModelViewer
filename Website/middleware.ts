import { NextResponse, NextRequest } from 'next/server'
import { getSession } from './lib/session'

export async function middleware(request: NextRequest) {
    const session = await getSession();
    const isAuthenticated = session !== null;

    // If the user is authenticated, continue as normal
    if (isAuthenticated) {
        return NextResponse.next()
    }

    // Redirect to login page if not authenticated
    return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
    matcher: [
        /*
        * Match all request paths except for the ones starting with:
        * - api (API routes)
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        * - login (login page)
        * - public assets (images, SVGs, etc.)
        */
        '/((?!api|_next/static|_next/image|favicon.ico|login|.*\\.).*)',
    ]
}