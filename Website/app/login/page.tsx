'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function LoginPage() {
    const router = useRouter();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const password = formData.get("password")

        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
        });

        if (response.ok) {

            await createSession(password?.valueOf() as string);
            router.push("/");
        } else {
            alert("Failed to login");
        }
    }

    return (
        <div className="flex items-center justify-center h-screen w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 border border-gray-300 rounded-lg">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="text" name="password" />
                <Button type="submit">Login</Button>
            </form>
        </div>
    );
}