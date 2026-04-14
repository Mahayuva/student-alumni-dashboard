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
        <div className="min-h-screen flex font-['Outfit']">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B1221] text-white p-16 flex-col justify-between overflow-hidden">
                {/* Background Image Overlay */}
                <div 
                    className="absolute inset-0 opacity-40 mix-blend-overlay"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1523050853051-f050540c4a1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                
                <div className="relative z-10 w-full space-y-12">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4">
                        <div className="bg-[#F39C12] p-2.5 rounded-lg shadow-lg shadow-orange-500/20">
                            <BookOpen className="w-8 h-8 text-black" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight font-['Playfair_Display']"> Alumsphere</h2>
                    </div>

                    {/* Main Slogan */}
                    <h1 className="text-6xl font-bold leading-[1.15] font-['Playfair_Display'] max-w-lg mt-24">
                        Connecting our past, present, and future.
                    </h1>

                    {/* Quote Section */}
                    <div className="border-l-4 border-[#F39C12] pl-6 py-2 space-y-3 mt-12 max-w-md">
                        <p className="text-xl italic text-slate-300 font-light leading-relaxed">
                            "Education is not the filling of a pail, but the lighting of a fire."
                        </p>
                        {/* <p className="text-sm tracking-widest text-[#F39C12] font-semibold uppercase">
                            — William Butler Yeats
                        </p> */}
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="relative z-10 text-sm font-light text-slate-500">
                    &copy; {new Date().getFullYear()} Alumunium Connect.
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="flex-1 flex flex-col justify-center items-center bg-[#F8FAFC] p-8 lg:p-20 overflow-y-auto">
                <div className="w-full max-w-[440px] space-y-10">
                    <div className="space-y-3">
                        <h2 className="text-[40px] font-bold text-[#0B1221] font-['Playfair_Display']">Welcome back</h2>
                        <p className="text-[#64748B] text-lg font-light">
                            Please enter your details to access your portal.
                        </p>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex p-1.5 bg-[#E2E8F0] rounded-xl font-medium">
                        <button
                            type="button"
                            onClick={() => setLoginRole("student")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm rounded-lg transition-all duration-300 ${
                                loginRole === "student"
                                    ? "bg-white text-[#0B1221] shadow-sm ring-1 ring-black/5"
                                    : "text-[#64748B] hover:text-[#0B1221]"
                            }`}
                        >
                            <BookOpen className={`w-4 h-4 ${loginRole === "student" ? "text-[#F39C12]" : ""}`} />
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginRole("alumni")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm rounded-lg transition-all duration-300 ${
                                loginRole === "alumni"
                                    ? "bg-white text-[#0B1221] shadow-sm ring-1 ring-black/5"
                                    : "text-[#64748B] hover:text-[#0B1221]"
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            Alumni
                        </button>
                        <button
                            type="button"
                            onClick={() => setLoginRole("admin")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm rounded-lg transition-all duration-300 ${
                                loginRole === "admin"
                                    ? "bg-white text-[#0B1221] shadow-sm ring-1 ring-black/5"
                                    : "text-[#64748B] hover:text-[#0B1221]"
                            }`}
                        >
                            <Building2 className="w-4 h-4" />
                            Institution
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-7">
                        <div className="space-y-2.5">
                            <label className="text-sm font-semibold text-[#334155] ml-1">University Email</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#0B1221]">
                                    <Mail className="w-5 h-5 text-[#94A3B8]" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Enter your email"
                                    className="w-full pl-12 pr-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] placeholder:text-[#94A3B8] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-sm font-semibold text-[#334155] ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#0B1221]">
                                    <Lock className="w-5 h-5 text-[#94A3B8]" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] placeholder:text-[#94A3B8] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="relative flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="remember" 
                                        className="peer appearance-none w-5 h-5 border-2 border-[#E2E8F0] rounded-md bg-white checked:bg-[#F39C12] checked:border-[#F39C12] transition-all cursor-pointer" 
                                    />
                                    <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <label htmlFor="remember" className="text-sm text-[#64748B] font-medium cursor-pointer select-none group-hover:text-[#334155] transition-colors">
                                    Remember me
                                </label>
                            </div>
                            <Link href="/forgot-password" className="text-sm font-bold text-[#F39C12] hover:text-[#D68910] transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4.5 bg-[#0B1221] hover:bg-[#1E293B] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-slate-900/10 group"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                <>
                                    <span>Sign in as {loginRole.charAt(0).toUpperCase() + loginRole.slice(1)}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4">
                        <span className="text-[#64748B] font-medium">Don't have an account? </span>
                        <Link href="/register" className="text-[#F39C12] font-bold hover:underline transition-all">
                            Apply for access
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
