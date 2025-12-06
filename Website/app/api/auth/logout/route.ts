'use server';

import { NextResponse } from "next/server";
import { deleteSession, getSession } from "@/lib/session";

export async function POST() {
    try {
        const session = await getSession();
        const wasEntraId = session?.authType === 'entraid';

        await deleteSession();

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
