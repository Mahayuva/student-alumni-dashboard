"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, ArrowLeft, CheckCircle2, User, Mail, Lock, Calendar, BookOpen, Users, Building2, ChevronRight, Check } from "lucide-react";

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
            className={`cursor-pointer group relative p-5 rounded-3xl border-2 transition-all duration-300 ${selected
                ? "border-[#ff00cc] bg-white shadow-xl shadow-pink-500/10 scale-[1.02]"
                : "border-slate-100 bg-white hover:border-slate-200"
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-all duration-300 ${selected ? "bg-gradient-to-br from-[#ff00cc] to-[#333399] text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-900"}`}>
                    <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="flex-1">
                    <h3 className={`font-bold text-lg transition-colors ${selected ? "text-slate-900" : "text-slate-600"}`}>
                        {title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                        {description}
                    </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selected ? "bg-[#ff00cc] border-[#ff00cc] scale-110" : "border-slate-200"}`}>
                    {selected && <Check className="w-3 h-3 text-white font-bold" strokeWidth={4} />}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen relative flex items-center justify-center font-['Outfit'] overflow-hidden">
            {/* Vibrant Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff00cc] via-[#333399] to-[#00ccff] animate-gradient-slow" />
            
            {/* Decorative Geometric Shapes */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] animate-pulse" />

            {/* Register Card */}
            <div className="relative z-10 w-full max-w-[620px] mx-4 py-4">
                <div className="bg-white p-8 lg:p-10 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] space-y-6 animate-in fade-in zoom-in-95 duration-700">
                    
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-br from-[#ff00cc] to-[#00ccff] rounded-2xl shadow-lg transform transition-transform hover:rotate-6 duration-300">
                            <GraduationCap className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                            Step {step} of 2 - {step === 1 ? "Select Your Role" : "Complete Profile"}
                        </p>
                        
                        {/* Progress Indicator */}
                        <div className="flex gap-2 justify-center mt-2">
                            <div className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= 1 ? "bg-[#ff00cc]" : "bg-slate-100"}`}></div>
                            <div className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= 2 ? "bg-[#00ccff]" : "bg-slate-100"}`}></div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-2xl flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-8 duration-500">
                            <RoleCard
                                id="student"
                                icon={BookOpen}
                                title="Student"
                                description="Current student seeking mentorship"
                                selected={role === "student"}
                            />
                            <RoleCard
                                id="alumni"
                                icon={Users}
                                title="Alumni"
                                description="Graduated professional ready to network"
                                selected={role === "alumni"}
                            />
                            <RoleCard
                                id="admin"
                                icon={Building2}
                                title="Institution"
                                description="School administrator managing portal"
                                selected={role === "admin"}
                            />

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-4 mt-4 bg-gradient-to-r from-[#ff00cc] to-[#333399] hover:opacity-90 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-pink-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                            >
                                <span>Next Step</span>
                                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                                    <input
                                        name="firstName"
                                        required
                                        type="text"
                                        placeholder="John"
                                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all text-slate-900 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                                    <input
                                        name="lastName"
                                        required
                                        type="text"
                                        placeholder="Doe"
                                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all text-slate-900 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                    <input
                                        name="email"
                                        required
                                        type="email"
                                        placeholder="you@university.edu"
                                        className="w-full pl-11 pr-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all text-slate-900 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {role === "student" && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Batch Year</label>
                                        <input
                                            name="batch"
                                            type="number"
                                            placeholder="2025"
                                            className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all text-slate-900 text-sm"
                                        />
                                    </div>
                                )}
                                {role === "alumni" && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Graduation Year</label>
                                        <input
                                            name="gradYear"
                                            type="number"
                                            placeholder="2020"
                                            className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all text-slate-900 text-sm"
                                        />
                                    </div>
                                )}
                                <div className={`${role === "admin" ? "col-span-2" : ""} space-y-1.5`}>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                                        {role === "admin" ? "Position" : "Department"}
                                    </label>
                                    <input
                                        name="department"
                                        type="text"
                                        placeholder="Engineering"
                                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all text-slate-900 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                                    <input
                                        name="password"
                                        required
                                        type="password"
                                        minLength={6}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all text-slate-900 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Confirm</label>
                                    <input
                                        name="confirmPassword"
                                        required
                                        type="password"
                                        minLength={6}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all text-slate-900 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="p-4 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center"
                                >
                                    <ArrowLeft className="w-4.5 h-4.5" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-4 bg-gradient-to-r from-[#333399] to-[#00ccff] hover:opacity-90 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isLoading ? (
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        "Complete Sign Up"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="text-center pt-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Already Have An Account?
                        </p>
                        <Link href="/login" className="inline-block mt-1.5 text-xs font-bold text-slate-900 hover:underline underline-offset-4">
                            LOG IN
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
