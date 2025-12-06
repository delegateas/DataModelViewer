import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({
                isAuthenticated: false,
                authType: null,
                user: null
            });
        }

        const response: {
            isAuthenticated: boolean;
            authType: 'password' | 'entraid';
            user: {
                userPrincipalName?: string;
                name?: string;
                authenticated?: boolean;
            };
        } = {
            isAuthenticated: true,
            authType: session.authType,
            user: {}
        };

        if (session.authType === 'entraid') {
            response.user = {
                userPrincipalName: session.userPrincipalName,
                name: session.name
            };
        } else {
            response.user = {
                authenticated: true
            };
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Session check error:', error);
        return NextResponse.json(
            { isAuthenticated: false, authType: null, user: null },
            { status: 500 }
        );
    }
}
