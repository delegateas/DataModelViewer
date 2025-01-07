'use server';

import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body: { code: string } = await req.json();
    const validCode = process.env.CODE;

    if (body.code !== validCode) {
        return NextResponse.json({}, { status: 401 });
    }

    return NextResponse.json({}, { status: 200 });
}