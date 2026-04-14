"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, ArrowLeft, Mail, CheckCircle2, Lock, ShieldCheck, KeyRound } from "lucide-react";

type ForgotStep = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<ForgotStep>("email");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.target as HTMLFormElement);
        const emailVal = formData.get("email") as string;
        setEmail(emailVal);

        try {
            // Mock API call to send OTP
            await new Promise((resolve) => setTimeout(resolve, 1500));
            console.log("OTP sent to:", emailVal);
            setStep("otp");
        } catch (error) {
            setError("Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Mock API call to verify OTP
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (otp === "123456") { // Mock check
                setStep("reset");
            } else {
                setError("Invalid OTP. Please check your email.");
            }
        } catch (error) {
            setError("Verification failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            // Mock API call to reset password
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setStep("success");
        } catch (error) {
            setError("Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-['Outfit']">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B1221] text-white p-16 flex-col justify-between overflow-hidden">
                <div 
                    className="absolute inset-0 opacity-30 mix-blend-overlay"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                
                <div className="relative z-10 w-full space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#F39C12] p-2.5 rounded-lg">
                            <GraduationCap className="w-8 h-8 text-black" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight font-['Playfair_Display']">Alumnium Connect</h2>
                    </div>

                    <h1 className="text-6xl font-bold leading-[1.15] font-['Playfair_Display'] max-w-lg mt-24">
                        Secure your <br />
                        <span className="text-[#F39C12]">account.</span>
                    </h1>
                    <p className="text-xl text-slate-300 font-light max-w-md leading-relaxed">
                        Follow the steps to reset your password and keep your connection with the community safe.
                    </p>
                </div>

                <div className="relative z-10 text-sm font-light text-slate-500">
                    &copy; {new Date().getFullYear()} Alumnium Connect. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="flex-1 flex flex-col justify-center items-center bg-[#F8FAFC] p-8 lg:p-20 overflow-y-auto">
                <div className="w-full max-w-[440px] space-y-10">
                    
                    {step !== "success" && (
                        <div className="space-y-3">
                            <h2 className="text-[40px] font-bold text-[#0B1221] font-['Playfair_Display'] leading-tight">
                                {step === "email" && "Forgot Password?"}
                                {step === "otp" && "Verify OTP"}
                                {step === "reset" && "Reset Password"}
                            </h2>
                            <p className="text-[#64748B] text-lg font-light">
                                {step === "email" && "No worries, we'll send you reset instructions."}
                                {step === "otp" && `We've sent a 6-digit code to ${email}`}
                                {step === "reset" && "Please enter your new password below."}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-3 animate-in fade-in duration-300">
                            <div className="bg-red-500 rounded-full p-1 text-white">
                                <ShieldCheck className="w-3 h-3" />
                            </div>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {step === "email" && (
                        <form onSubmit={handleSendOTP} className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2.5">
                                <label className="text-sm font-semibold text-[#334155] ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] group-focus-within:text-[#0B1221] transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="Enter your email"
                                        className="w-full pl-12 pr-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] placeholder:text-[#94A3B8] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4.5 bg-[#0B1221] hover:bg-[#1E293B] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-slate-900/10 group"
                            >
                                {isLoading ? "Sending..." : "Send OTP"}
                                {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    )}

                    {step === "otp" && (
                        <form onSubmit={handleVerifyOTP} className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2.5">
                                <label className="text-sm font-semibold text-[#334155] ml-1">One-Time Password</label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] group-focus-within:text-[#0B1221] transition-colors" />
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        placeholder="0 0 0 0 0 0"
                                        className="w-full pl-12 pr-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] tracking-[0.5em] font-bold text-center placeholder:text-[#94A3B8] placeholder:font-light placeholder:tracking-normal focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 ml-1">Hint: Try 123456</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4.5 bg-[#0B1221] hover:bg-[#1E293B] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-slate-900/10 group"
                            >
                                {isLoading ? "Verifying..." : "Verify OTP"}
                                {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => setStep("email")}
                                className="w-full text-sm font-bold text-[#64748B] hover:text-[#0B1221] transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Change email
                            </button>
                        </form>
                    )}

                    {step === "reset" && (
                        <form onSubmit={handleResetPassword} className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2.5">
                                <label className="text-sm font-semibold text-[#334155] ml-1">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] group-focus-within:text-[#0B1221] transition-colors" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-sm font-semibold text-[#334155] ml-1">Confirm New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] group-focus-within:text-[#0B1221] transition-colors" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-5 py-4 bg-white rounded-xl border border-[#E2E8F0] text-[#0B1221] focus:border-[#0B1221] focus:ring-4 focus:ring-[#0B1221]/5 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4.5 bg-[#0B1221] hover:bg-[#1E293B] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-slate-900/10 group"
                            >
                                {isLoading ? "Resetting..." : "Reset Password"}
                                {!isLoading && <CheckCircle2 className="w-5 h-5" />}
                            </button>
                        </form>
                    )}

                    {step === "success" && (
                        <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold text-[#0B1221] font-['Playfair_Display']">Password reset successfully</h2>
                                <p className="text-[#64748B] text-lg font-light">
                                    Your password has been securely updated. You can now log in with your new credentials.
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="inline-flex w-full py-4.5 bg-[#0B1221] hover:bg-[#1E293B] text-white rounded-xl font-bold justify-center gap-3 items-center transition-all shadow-xl shadow-slate-900/10"
                            >
                                Back to login <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    )}

                    {step !== "success" && (
                        <div className="text-center pt-4">
                            <Link href="/login" className="text-sm font-bold text-[#F39C12] hover:text-[#D68910] inline-flex items-center gap-2 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to log in
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Simple ChevronRight icon implementation since it's not imported
function ChevronRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}
