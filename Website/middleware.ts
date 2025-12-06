import { NextResponse, NextRequest } from 'next/server'
import { getSession, createEntraIdSession } from './lib/session'
import {
    isEntraIdEnabled,
    isPasswordAuthDisabled,
    parseEntraIdPrincipal,
    validateGroupAccess
} from './lib/auth/entraid'

export async function middleware(request: NextRequest) {
    let isAuthenticated = false;

    // 1. Check EntraID authentication first (if enabled)
    if (isEntraIdEnabled()) {
        const principalHeader = request.headers.get('X-MS-CLIENT-PRINCIPAL');

        if (principalHeader) {
            const userInfo = parseEntraIdPrincipal(principalHeader);

            if (userInfo) {
                // Validate group access
                if (!validateGroupAccess(userInfo.groups)) {
                    return NextResponse.json(
                        { error: 'Access denied. You are not in an allowed group.' },
                        { status: 403 }
                    );
                }

                // Check if we need to create/update session
                const session = await getSession();
                if (!session || session.authType !== 'entraid' || session.userId !== userInfo.userId) {
                    // Create new session for this EntraID user
                    await createEntraIdSession(userInfo);
                }

                isAuthenticated = true;
            }
        }
    }

    // 2. Check password session (if not authenticated via EntraID)
    if (!isAuthenticated && !isPasswordAuthDisabled()) {
        const session = await getSession();
        if (session && session.authType === 'password') {
            isAuthenticated = true;
        }
    }

    // 3. Handle authentication result
    if (isAuthenticated) {
        return NextResponse.next();
    }

    // Allow access to public endpoints
    const publicApiEndpoints = ['/api/auth/login', '/api/version'];
    if (publicApiEndpoints.includes(request.nextUrl.pathname)) {
        return NextResponse.next();
    }

    // For API routes, return 401
    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // For page routes, redirect to login page
    // The login page will show appropriate options based on config
    return NextResponse.redirect(new URL('/login', request.url));
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