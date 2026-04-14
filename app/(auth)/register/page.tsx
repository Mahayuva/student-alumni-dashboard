"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, ArrowLeft, CheckCircle2, User, Mail, Lock, Calendar, BookOpen, Users, Building2, ChevronRight } from "lucide-react";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<"student" | "alumni" | "admin">("student");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(event.currentTarget);
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const name = `${firstName} ${lastName}`.trim();

        const email = formData.get("email");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");
        const batch = formData.get("batch");
        const gradYear = formData.get("gradYear");
        const department = formData.get("department");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role,
                    ...(role === "student" && batch && { batch: parseInt(batch as string) }),
                    ...(role === "alumni" && gradYear && { gradYear: parseInt(gradYear as string) }),
                }),
            });

            if (!res.ok) {
                const { message } = await res.json();
                throw new Error(message || "Something went wrong");
            }

            router.push("/login?registered=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const RoleCard = ({
        id,
        icon: Icon,
        title,
        description,
        selected
    }: {
        id: "student" | "alumni" | "admin",
        icon: any,
        title: string,
        description: string,
        selected: boolean
    }) => (
        <div
            onClick={() => setRole(id)}
            className={`cursor-pointer group relative p-5 rounded-2xl border-2 transition-all duration-300 ${selected
                ? "border-[#0B1221] bg-white shadow-xl shadow-slate-200"
                : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:translate-y-[-2px]"
                }`}
        >
            <div className="flex items-center gap-5">
                <div className={`p-4 rounded-xl transition-colors ${selected ? "bg-[#0B1221] text-white" : "bg-slate-50 text-slate-400 group-hover:bg-[#0B1221]/5 group-hover:text-[#0B1221]"}`}>
                    <Icon className={`w-7 h-7 ${selected && id === "student" ? "text-[#F39C12]" : ""}`} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-[#0B1221] text-lg">
                        {title}
                    </h3>
                    <p className="text-sm text-[#64748B] font-light mt-0.5">
                        {description}
                    </p>
                </div>
                {selected && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-6">
                        <div className="bg-[#0B1221] rounded-full p-1">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex font-['Outfit']">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B1221] text-white p-16 flex-col justify-between overflow-hidden">
                {/* Background Image Overlay */}
                <div 
                    className="absolute inset-0 opacity-30 mix-blend-overlay"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                
                <div className="relative z-10 w-full space-y-12">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4">
                        <div className="bg-[#F39C12] p-2.5 rounded-lg">
                            <GraduationCap className="w-8 h-8 text-black" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight font-['Playfair_Display']">Alumnium Connect</h2>
                    </div>

                    {/* Main Slogan */}
                    <h1 className="text-6xl font-bold leading-[1.15] font-['Playfair_Display'] max-w-lg mt-24">
                        Join our thriving community today.
                    </h1>
                    <p className="text-xl text-slate-300 font-light max-w-md leading-relaxed">
                        Whether you're a student seeking guidance or an alumni ready to mentor, there's a place for you here.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 pt-10">
                        <div className="space-y-1">
                            <div className="text-4xl font-bold font-['Playfair_Display'] text-[#F39C12]">5K+</div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Students</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-4xl font-bold font-['Playfair_Display'] text-white">3K+</div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Alumni</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-4xl font-bold font-['Playfair_Display'] text-white">50+</div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Institutions</div>
                        </div>
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="relative z-10 text-sm font-light text-slate-500">
                    &copy; {new Date().getFullYear()} Alumnium Connect. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="flex-1 flex flex-col justify-center items-center bg-[#F8FAFC] p-8 lg:p-20 overflow-y-auto">
                <div className="w-full max-w-[480px]">
                    <div className="mb-12">
                        <h2 className="text-[40px] font-bold text-[#0B1221] font-['Playfair_Display'] leading-tight">Create account</h2>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-[#64748B] text-lg font-light">
                                Step {step} of 2 - <span className="text-[#0B1221] font-medium">{step === 1 ? "Choose your role" : "Your details"}</span>
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex gap-2 mt-8 h-1.5 w-full">
                            <div className={`h-full rounded-full transition-all duration-500 ${step >= 1 ? "bg-[#0B1221] w-1/2" : "bg-[#E2E8F0] w-1/2"}`}></div>
                            <div className={`h-full rounded-full transition-all duration-500 ${step >= 2 ? "bg-[#0B1221] w-1/2" : "bg-[#E2E8F0] w-1/2"}`}></div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-3 border border-red-100 animate-in fade-in duration-300">
                            <div className="bg-red-500 rounded-full p-1">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] mb-4 ml-1">I am a...</h3>

                            <RoleCard
                                id="student"
                                icon={BookOpen}
                                title="Student"
                                description="Current student looking for mentorship"
                                selected={role === "student"}
                            />

                            <RoleCard
                                id="alumni"
                                icon={Users}
                                title="Alumni"
                                description="Graduated and ready to give back"
                                selected={role === "alumni"}
                            />

                            <RoleCard
                                id="admin"
                                icon={Building2}
                                title="Institution"
                                description="College/University administrator"
                                selected={role === "admin"}
                            />

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-5 mt-10 bg-[#0B1221] hover:bg-[#1E293B] text-white rounded-2xl font-bold shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                            >
                                <span>Continue to details</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-[#334155] ml-1">Full Name</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        name="firstName"
                                        required
                                        type="text"
                                        placeholder="First Name"
                                        className="w-full px-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] placeholder:text-[#94A3B8] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all placeholder:font-light"
                                    />
                                    <input
                                        name="lastName"
                                        required
                                        type="text"
                                        placeholder="Last Name"
                                        className="w-full px-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] placeholder:text-[#94A3B8] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all placeholder:font-light"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-[#334155] ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] group-focus-within:text-[#0B1221] transition-colors" />
                                    <input
                                        name="email"
                                        required
                                        type="email"
                                        placeholder="you@university.edu"
                                        className="w-full pl-12 pr-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] placeholder:text-[#94A3B8] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all placeholder:font-light"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {role === "student" && (
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-[#334155] ml-1">Batch Year</label>
                                        <input
                                            name="batch"
                                            type="number"
                                            placeholder="2025"
                                            className="w-full px-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] placeholder:text-[#94A3B8] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all placeholder:font-light"
                                        />
                                    </div>
                                )}
                                {role === "alumni" && (
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-[#334155] ml-1">Graduation Year</label>
                                        <input
                                            name="gradYear"
                                            type="number"
                                            placeholder="2020"
                                            className="w-full px-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] placeholder:text-[#94A3B8] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all placeholder:font-light"
                                        />
                                    </div>
                                )}
                                <div className={`${role === "admin" ? "col-span-2" : ""} space-y-3`}>
                                    <label className="text-sm font-bold text-[#334155] ml-1">
                                        {role === "admin" ? "Position" : "Department"}
                                    </label>
                                    <input
                                        name="department"
                                        type="text"
                                        placeholder={role === "student" ? "Computer Science" : role === "admin" ? "Admissions Officer" : "Department Name"}
                                        className="w-full px-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] placeholder:text-[#94A3B8] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all placeholder:font-light"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-[#334155] ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] group-focus-within:text-[#0B1221] transition-colors" />
                                    <input
                                        name="password"
                                        required
                                        type="password"
                                        minLength={6}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] placeholder:text-[#94A3B8] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all placeholder:font-light"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-[#334155] ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] group-focus-within:text-[#0B1221] transition-colors" />
                                    <input
                                        name="confirmPassword"
                                        required
                                        type="password"
                                        minLength={6}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] placeholder:text-[#94A3B8] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all placeholder:font-light"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-8 py-4 border border-[#E2E8F0] text-[#64748B] rounded-xl font-bold hover:bg-white hover:border-[#0B1221] hover:text-[#0B1221] transition-all flex items-center gap-2 group"
                                >
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
                                    <span>Back</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-4 bg-[#0B1221] hover:bg-[#1E293B] text-white rounded-xl font-bold shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Account...
                                        </span>
                                    ) : (
                                        <>
                                            <span>Create Account</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-12 text-center">
                        <p className="text-[#64748B] font-medium">
                            Already have an account?{" "}
                            <Link href="/login" className="text-[#F39C12] font-bold hover:underline transition-all">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
