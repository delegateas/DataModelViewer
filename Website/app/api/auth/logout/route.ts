'use server';

import { NextResponse } from "next/server";
import { deleteSession, getSession } from "@/lib/session";
import { signOut } from "@/auth";

export async function POST() {
    try {
        const session = await getSession();
        const wasEntraId = session?.authType === 'entraid';

        // Delete custom session cookie
        await deleteSession();

        // If EntraID, also sign out from NextAuth
        if (wasEntraId) {
            await signOut({ redirect: false });
        }

        return NextResponse.json({
            success: true,
            redirectToEntraIdLogout: wasEntraId
        });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { success: false, error: 'Logout failed' },
            { status: 500 }
        );
    }
}
