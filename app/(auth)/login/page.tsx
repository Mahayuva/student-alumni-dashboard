"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { GraduationCap, ArrowRight, Mail, Lock, Building2 } from "lucide-react";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [loginRole, setLoginRole] = useState<"student" | "alumni" | "admin">("student");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                alert("Invalid credentials");
                setIsLoading(false);
                return;
            }

            // Redirect based on role (this logic might need adjustment if role is not in session immediately available to client without refresh, 
            // but for now we'll trust the flow or standard redirect)
            // Ideally getting the session here to check role would be better, but let's stick to the requested flow.
            // Actually, let's just redirect to the dashboard home, and let middleware/layout handle specifics if needed? 
            // The original code had role-based redirect.
            // Let's assume the user is redirected to the main dashboard or we can fetch the session.
            // For simplicity and speed as requested:
            if (loginRole === "admin") {
                window.location.href = "/admin/dashboard";
            } else {
                window.location.href = "/student/dashboard";
            }

        } catch (error) {
            console.error("Login failed", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-12 flex-col justify-between overflow-hidden">
                {/* Background Shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                {/* Header */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-xl border border-white/20">
                        <GraduationCap className="w-6 h-6" />
                        <span className="font-semibold tracking-wide">Alumni Connect</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Welcome back to <br />
                        <span className="text-purple-200">your community</span>
                    </h1>
                    <p className="text-lg text-purple-100 leading-relaxed mb-8">
                        Stay connected with your alma mater. Access exclusive events, mentorship programs,
                        and career opportunities tailored just for you.
                    </p>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-sm text-purple-200">
                    © {new Date().getFullYear()} Alumni Connect. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Please sign in to your account
                        </p>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                        {(["student", "alumni", "admin"] as const).map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setLoginRole(r)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${loginRole === r
                                    ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                    }`}
                            >
                                {r === "admin" ? "Institution" : r}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="you@college.edu"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                <Link href="/forgot-password" className="text-sm text-indigo-600 font-medium hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="remember" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">Remember me for 30 days</label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                "Signing in..."
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
