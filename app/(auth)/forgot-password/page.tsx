"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email") as string;

        try {
            // Fake API call for reset link
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setIsSuccess(true);
        } catch (error) {
            console.error("Failed to send reset email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-12 flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-xl border border-white/20">
                        <GraduationCap className="w-6 h-6" />
                        <span className="font-semibold tracking-wide">Alumni Connect</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Reset your <br />
                        <span className="text-purple-200">password</span>
                    </h1>
                    <p className="text-lg text-purple-100 leading-relaxed mb-8">
                        Enter your email address to receive a link to reset your password and get back to connecting.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-purple-200">
                    © {new Date().getFullYear()} Alumni Connect. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
                <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Forgot Password?</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            No worries, we'll send you reset instructions.
                        </p>
                    </div>

                    {isSuccess ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center space-y-4">
                            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Check your email</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                We've sent a password reset link to your email address. Please check your inbox and spam folder.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm justify-center gap-2 items-center transition-all mt-4"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to log in
                            </Link>
                        </div>
                    ) : (
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

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? "Sending..." : "Reset Password"}
                            </button>

                            <div className="text-center pt-4">
                                <Link href="/login" className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium inline-flex items-center gap-2 transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Back to log in
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
