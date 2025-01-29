'use server';

import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body: { password: string } = await req.json();
    const validPassword = process.env.WebsitePassword;

    if (body.password !== validPassword) {
        return NextResponse.json({}, { status: 401 });
    }

    return NextResponse.json({}, { status: 200 });
}