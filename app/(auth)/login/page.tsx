"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { GraduationCap, ArrowRight, Mail, Lock, Building2, BookOpen, Users } from "lucide-react";

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
                role: loginRole,
                redirect: false,
            });

            if (res?.error) {
                if (res.error === "NOT_AUTHORIZED_ROLE") {
                    alert(`Access Denied: You do not have permissions to login for portals as a ${loginRole.toUpperCase()}. Please use the correct tab.`);
                } else {
                    alert("Invalid credentials. Please check your email and password.");
                }
                setIsLoading(false);
                return;
            }

            const sessionRes = await fetch("/api/auth/session");
            const session = await sessionRes.json();
            const userRole = session?.user?.role;

            if (userRole === "ADMIN") {
                window.location.href = "/admin/dashboard";
            } else if (userRole === "ALUMNI") {
                window.location.href = "/alumni/dashboard";
            } else {
                window.location.href = "/student/dashboard";
            }

        } catch (error) {
            console.error("Login failed", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center font-['Outfit'] overflow-hidden">
            {/* Vibrant Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff00cc] via-[#333399] to-[#00ccff] animate-gradient-slow" />
            
            {/* Decorative Geometric Shapes */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] animate-pulse" />

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-[560px] mx-4 py-4">
                <div className="bg-white p-8 lg:p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] space-y-6 animate-in fade-in zoom-in-95 duration-700">
                    
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-br from-[#ff00cc] to-[#00ccff] rounded-2xl shadow-lg transform transition-transform hover:rotate-6 duration-300">
                            <BookOpen className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Login</h1>
                    </div>

                    {/* Role Selection */}
                    <div className="bg-slate-100 p-1 rounded-2xl flex font-semibold shadow-inner">
                        <button
                            type="button"
                            onClick={() => setLoginRole("student")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs rounded-xl transition-all duration-300 ${
                                loginRole === "student"
                                    ? "bg-white text-slate-900 shadow-md ring-1 ring-black/5"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginRole("alumni")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs rounded-xl transition-all duration-300 ${
                                loginRole === "alumni"
                                    ? "bg-white text-slate-900 shadow-md ring-1 ring-black/5"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            Alumni
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginRole("admin")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs rounded-xl transition-all duration-300 ${
                                loginRole === "admin"
                                    ? "bg-white text-slate-900 shadow-md ring-1 ring-black/5"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            Admin
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Username / Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Type your email"
                                    className="w-full pl-11 pr-6 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 focus:shadow-sm outline-none transition-all text-slate-900 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                                <Link href="/forgot-password" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="Type your password"
                                    className="w-full pl-11 pr-6 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 focus:shadow-sm outline-none transition-all text-slate-900 text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-[#ff00cc] to-[#00ccff] hover:from-[#e600b8] hover:to-[#00b8e6] text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 group mt-2"
                        >
                            {isLoading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Don't have an account?
                        </p>
                        <Link href="/register" className="inline-block mt-2 text-xs font-bold text-slate-900 hover:underline underline-offset-4">
                            SIGN UP
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
