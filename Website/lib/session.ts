'use server';
import 'server-only';
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation'

const secretKey = process.env.WebsiteSessionSecret;
const encodedKey = new TextEncoder().encode(secretKey);

export type Session = {
    password: string;
    expiresAt: Date;
}

export async function encrypt(payload: Session) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ["HS256"],
        });

        return payload as Session;
    } catch {
        console.log('Failed to verify session');
        return null;
    }
}

export async function createSession(password: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ password, expiresAt });
    (await cookies()).set(
        "session",
        session,
        {
            httpOnly: true,
            secure: true,
            expires: expiresAt,
            sameSite: "lax",
            path: "/",
        });
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) {
        return null;
    }
    
    return await decrypt(session);
}