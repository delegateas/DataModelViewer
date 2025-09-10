import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
    try {
        const session = await getSession();
        const isAuthenticated = session !== null;
        
        return NextResponse.json({ 
            isAuthenticated,
            user: isAuthenticated ? { authenticated: true } : null 
        });
    } catch (error) {
        console.error('Session check error:', error);
        return NextResponse.json(
            { isAuthenticated: false, user: null }, 
            { status: 500 }
        );
    }
}
