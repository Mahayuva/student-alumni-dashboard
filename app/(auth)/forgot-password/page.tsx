"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, ArrowLeft, Mail, CheckCircle2, Lock, ShieldCheck, KeyRound, Check, BookOpen } from "lucide-react";

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
            // Mock API call
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setStep("otp");
        } catch (error) {
            setError("Failed to send OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (otp === "123456") {
                setStep("reset");
            } else {
                setError("Invalid OTP code.");
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
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setStep("success");
        } catch (error) {
            setError("Reset failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center font-['Outfit'] overflow-hidden">
            {/* Vibrant Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff00cc] via-[#333399] to-[#00ccff] animate-gradient-slow" />
            
            {/* Decorative Geometric Shapes */}
            <div className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] bg-white/10 rounded-full blur-[140px] animate-pulse" />
            <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] animate-pulse" />

            {/* Recovery Card */}
            <div className="relative z-10 w-full max-w-[560px] mx-4 py-4">
                <div className="bg-white p-8 lg:p-10 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] space-y-6 animate-in fade-in zoom-in-95 duration-700">
                    
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-br from-[#ff00cc] to-[#00ccff] rounded-2xl shadow-lg transform transition-transform hover:rotate-6 duration-300">
                            <KeyRound className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {step === "email" && "Recover"}
                            {step === "otp" && "Verify"}
                            {step === "reset" && "Secure"}
                            {step === "success" && "Success"}
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                            {step === "email" && "Enter your email to reset"}
                            {step === "otp" && `OTP sent to ${email}`}
                            {step === "reset" && "Set your new password"}
                            {step === "success" && "Password updated successfully"}
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-[11px] rounded-2xl flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    {step === "email" && (
                        <form onSubmit={handleSendOTP} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">University Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="you@university.edu"
                                        className="w-full pl-11 pr-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all text-slate-900 text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-[#ff00cc] to-[#333399] hover:opacity-90 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-pink-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-2"
                            >
                                {isLoading ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    "Send Recovery OTP"
                                )}
                            </button>
                        </form>
                    )}

                    {step === "otp" && (
                        <form onSubmit={handleVerifyOTP} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="space-y-1.5 text-center">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enter 6-digit Code (Mock: 123456)</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="w-full py-4 bg-slate-50 rounded-2xl border-2 border-transparent text-slate-900 tracking-[0.8em] text-center font-bold focus:bg-white focus:border-slate-200 outline-none transition-all text-lg"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-[#333399] to-[#00ccff] hover:opacity-90 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    "Verify & Continue"
                                )}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => setStep("email")}
                                className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
                            >
                                Change Email
                            </button>
                        </form>
                    )}

                    {step === "reset" && (
                        <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all text-slate-900 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Confirm</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all text-slate-900 text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-[#ff00cc] to-[#333399] hover:opacity-90 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-pink-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    "Reset Password"
                                )}
                            </button>
                        </form>
                    )}

                    {step === "success" && (
                        <div className="text-center space-y-6 animate-in zoom-in-95 duration-700">
                            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-100">
                                <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-extrabold text-slate-900">All Set!</h2>
                                <p className="text-slate-400 text-xs font-medium">
                                    Your password has been updated.
                                </p>
                            </div>
                            <Link href="/login" className="flex w-full py-4 bg-gradient-to-r from-[#ff00cc] to-[#00ccff] hover:opacity-90 text-white rounded-full font-bold justify-center items-center gap-3 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] uppercase tracking-widest text-xs">
                                Go to Login
                            </Link>
                        </div>
                    )}

                    {step !== "success" && (
                        <div className="text-center pt-2 border-t border-slate-50">
                            <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
