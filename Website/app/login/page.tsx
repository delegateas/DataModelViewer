'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSession } from "@/lib/session";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { LastSynched } from "@/generated/Data";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [version, setVersion] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/version')
            .then((res) => res.json())
            .then((data) => setVersion(data.version))
            .catch(() => setVersion('Unknown'))
    }, []);

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-300 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <img
                            src="/DMVLOGOHORZ.svg"
                            alt="Data Model Viewer Logo"
                            className="h-16 sm:h-20 object-contain"
                        />
                    </div>
                </div>

                {/* Login Form */}
                <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">

                    <h1 className="text-md text-gray-400 text">Enter model password</h1>
                    <h1 className="text-2xl font-semibold text-gray-700 mb-8 text mt-0">Welcome back</h1>


                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="pr-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-blue-400 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
                        >
                            Sign In
                        </Button>
                    </form>
                </div>
                
                {/* Footer Information */}
                <div className="mt-6 text-center space-y-1 text-gray-700 text-xs">
                    <div className="">
                        Last Synched: <b>{LastSynched ? LastSynched.toLocaleString(undefined, { 
                            timeZoneName: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '...'}</b>
                    </div>
                    <div className="">
                        Version: <b>{version ?? '...'}</b>
                    </div>
                </div>
            </div>
        </div>
    );
}