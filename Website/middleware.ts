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
    matcher: '/',
}