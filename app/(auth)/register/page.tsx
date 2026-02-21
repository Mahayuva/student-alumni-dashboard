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
                    // Assuming we might want to save department in profile later, 
                    // but for now the API might not handle it directly unless we updated it.
                    // We'll leave it as is for visual completeness if the backend ignores extra fields.
                }),
            });

            if (!res.ok) {
                const { message } = await res.json();
                throw new Error(message || "Something went wrong");
            }

            // Redirect to login on success
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
            className={`cursor-pointer group relative p-4 rounded-xl border-2 transition-all duration-200 ${selected
                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-900"
                }`}
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${selected ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className={`font-semibold ${selected ? "text-blue-900 dark:text-blue-100" : "text-slate-900 dark:text-white"}`}>
                        {title}
                    </h3>
                    <p className={`text-sm mt-1 ${selected ? "text-blue-700 dark:text-blue-300" : "text-slate-500"}`}>
                        {description}
                    </p>
                </div>
                {selected && (
                    <div className="absolute top-4 right-4 text-blue-600">
                        <CheckCircle2 className="w-6 h-6 fill-blue-600 text-white" />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white p-12 flex-col justify-between overflow-hidden">
                {/* Background Shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

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
                        Join our thriving <br />
                        <span className="text-blue-200">community today</span>
                    </h1>
                    <p className="text-lg text-blue-100 leading-relaxed mb-8">
                        Whether you're a student seeking guidance or an
                        alumni ready to mentor, there's a place for you
                        here.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                            <div className="text-2xl font-bold">5K+</div>
                            <div className="text-xs text-blue-200 uppercase tracking-wider mt-1">Students</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                            <div className="text-2xl font-bold">3K+</div>
                            <div className="text-xs text-blue-200 uppercase tracking-wider mt-1">Alumni</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                            <div className="text-2xl font-bold">50+</div>
                            <div className="text-xs text-blue-200 uppercase tracking-wider mt-1">Institutions</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-sm text-blue-200">
                    © {new Date().getFullYear()} Alumni Connect. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-md">
                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Create account</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Step {step} of 2 - {step === 1 ? "Choose your role" : "Your details"}
                        </p>

                        {/* Progress Bar */}
                        <div className="flex gap-2 mt-6 h-1.5 w-full">
                            <div className={`h-full rounded-full transition-all duration-300 ${step >= 1 ? "bg-blue-600 w-1/2" : "bg-slate-200 w-1/2"}`}></div>
                            <div className={`h-full rounded-full transition-all duration-300 ${step >= 2 ? "bg-blue-600 w-1/2" : "bg-slate-200 w-1/2"}`}></div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 border border-red-100">
                            <CheckCircle2 className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">I am a...</h3>

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
                                className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            name="firstName"
                                            required
                                            type="text"
                                            placeholder="First Name"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        />
                                        <input
                                            name="lastName"
                                            required
                                            type="text"
                                            placeholder="Last Name"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        name="email"
                                        required
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {role === "student" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Batch/Year</label>
                                        <input
                                            name="batch"
                                            type="number"
                                            placeholder="2025"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                )}
                                {role === "alumni" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Graduation Year</label>
                                        <input
                                            name="gradYear"
                                            type="number"
                                            placeholder="2020"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                )}
                                <div className={`${role === "admin" ? "col-span-2" : ""} space-y-2`}>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {role === "admin" ? "Position / Role" : "Department"}
                                    </label>
                                    <input
                                        name="department"
                                        type="text"
                                        placeholder={role === "student" ? "CS" : role === "admin" ? "Administrator" : "Engineering"}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        name="password"
                                        required
                                        type="password"
                                        minLength={6}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        name="confirmPassword"
                                        required
                                        type="password"
                                        minLength={6}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 py-4 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-5 h-5" /> Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        "Creating Account..."
                                    ) : (
                                        <>
                                            Create Account <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
