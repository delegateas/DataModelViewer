'use server';

import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

export async function POST(req: Request) {
    try {
        await deleteSession();
        return NextResponse.redirect(new URL('/login', req.url));
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Failed to logout' }, 
            { status: 500 }
        );
    }
}
