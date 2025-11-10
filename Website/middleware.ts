import { NextResponse, NextRequest } from 'next/server'
import { getSession } from './lib/session'

export async function middleware(request: NextRequest) {
    const session = await getSession();
    const isAuthenticated = session !== null;

    // If the user is authenticated, continue as normal
    if (isAuthenticated) {
        return NextResponse.next()
    }

    // Allow access to public API endpoints without authentication
    const publicApiEndpoints = ['/api/auth/login', '/api/version'];
    if (publicApiEndpoints.includes(request.nextUrl.pathname)) {
        return NextResponse.next()
    }

    // For API routes, return 401 Unauthorized
    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    // For page routes, redirect to login page
    return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
    matcher: [
        /*
        * Match all request paths except for the ones starting with:
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        * - login (login page)
        * - public assets (images, SVGs, etc.)
        */
        '/((?!_next/static|_next/image|favicon.ico|login|.*\\.).*)',
    ]
}