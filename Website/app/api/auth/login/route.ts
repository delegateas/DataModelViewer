'use server';

import { NextResponse } from "next/server";
import {
    checkRateLimit,
    recordFailedAttempt,
    recordSuccessfulAttempt,
    getClientIp
} from "@/lib/auth/rateLimit";

export async function POST(req: Request) {
    const clientIp = getClientIp(req);

    // Check if the IP is currently rate limited
    const rateLimitCheck = checkRateLimit(clientIp);
    if (rateLimitCheck.isLocked) {
        return NextResponse.json(
            {
                error: rateLimitCheck.message,
                remainingTime: rateLimitCheck.remainingTime
            },
            { status: 429 } // 429 Too Many Requests
        );
    }

    const body: { password: string } = await req.json();
    const validPassword = process.env.WebsitePassword;

    // Validate password
    if (body.password !== validPassword) {
        const failureResult = recordFailedAttempt(clientIp);

        if (failureResult.isLocked) {
            return NextResponse.json(
                {
                    error: failureResult.message,
                    remainingTime: failureResult.remainingTime
                },
                { status: 429 }
            );
        }

        return NextResponse.json(
            {
                error: failureResult.message || "Invalid password",
                attemptsRemaining: failureResult.attemptsRemaining
            },
            { status: 401 }
        );
    }

    // Successful login - reset attempt counter
    recordSuccessfulAttempt(clientIp);

    return NextResponse.json({}, { status: 200 });
}