'use server';

import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

export async function POST() {
    try {
        await deleteSession();
        // Return success response instead of redirect since we handle navigation client-side
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Failed to logout' }, 
            { status: 500 }
        );
    }
}
