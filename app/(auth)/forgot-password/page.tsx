"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, ArrowLeft, Mail, CheckCircle2, Lock, ShieldCheck, KeyRound, Check } from "lucide-react";

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
            {/* Background */}
            <div 
                className="absolute inset-0 z-0 scale-105"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.6) saturate(1.2)'
                }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-black/80" />
            <div className="absolute inset-0 z-0 backdrop-blur-[2px]" />

            {/* Glass Card */}
            <div className="relative z-10 w-full max-w-[420px] mx-4 py-8">
                <div className="backdrop-blur-2xl bg-white/10 p-8 rounded-[32px] border border-white/20 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-700">
                    
                    {step !== "success" && (
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center p-2.5 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md">
                                <KeyRound className="w-7 h-7 text-[#F39C12]" strokeWidth={2} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-bold text-white font-['Playfair_Display'] tracking-tight">
                                    {step === "email" && "Recover"}
                                    {step === "otp" && "Verify"}
                                    {step === "reset" && "Secure"}
                                </h2>
                                <p className="text-white/60 text-sm font-light">
                                    {step === "email" && "We'll send you reset instructions"}
                                    {step === "otp" && `OTP sent to ${email}`}
                                    {step === "reset" && "Set your new secure password"}
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/20 text-red-100 text-[13px] rounded-xl border border-red-500/30 flex items-center gap-2 animate-in fade-in duration-300">
                            <ShieldCheck className="w-4 h-4" />
                            <p>{error}</p>
                        </div>
                    )}

                    {step === "email" && (
                        <form onSubmit={handleSendOTP} className="space-y-5 animate-in fade-in duration-500">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Email address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/50 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="your@university.edu"
                                        className="w-full pl-11 pr-5 py-3.5 bg-white/5 rounded-2xl border border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-white/30 outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-white text-[#0B1221] rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] hover:bg-[#F39C12] hover:text-white shadow-xl shadow-black/20"
                            >
                                {isLoading ? <div className="animate-spin h-5 w-5 border-2 border-[#0B1221] border-t-transparent rounded-full" /> : <span>Send OTP</span>}
                            </button>
                        </form>
                    )}

                    {step === "otp" && (
                        <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in fade-in duration-500">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">OTP Code (Mock: 123456)</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="w-full py-4 bg-white/5 rounded-2xl border border-white/10 text-white tracking-[0.8em] text-center font-bold focus:bg-white/10 focus:border-white/30 outline-none transition-all text-lg"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-white text-[#0B1221] rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] hover:bg-[#F39C12] hover:text-white shadow-xl shadow-black/20"
                            >
                                {isLoading ? <div className="animate-spin h-5 w-5 border-2 border-[#0B1221] border-t-transparent rounded-full" /> : <span>Verify code</span>}
                            </button>
                        </form>
                    )}

                    {step === "reset" && (
                        <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in duration-500">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full px-5 py-3.5 bg-white/5 rounded-2xl border border-white/10 text-white focus:bg-white/10 focus:border-white/30 outline-none transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-5 py-3.5 bg-white/5 rounded-2xl border border-white/10 text-white focus:bg-white/10 focus:border-white/30 outline-none transition-all text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-white text-[#0B1221] rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] hover:bg-[#F39C12] hover:text-white shadow-xl shadow-black/20 pt-2"
                            >
                                {isLoading ? <div className="animate-spin h-5 w-5 border-2 border-[#0B1221] border-t-transparent rounded-full" /> : <span>Reset Password</span>}
                            </button>
                        </form>
                    )}

                    {step === "success" && (
                        <div className="text-center space-y-5 animate-in zoom-in-95 duration-500">
                            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-md">
                                <Check className="w-8 h-8 text-[#F39C12]" strokeWidth={3} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-bold text-white font-['Playfair_Display']">All set!</h2>
                                <p className="text-white/60 text-sm font-light">
                                    Your password has been securely updated.
                                </p>
                            </div>
                            <Link href="/login" className="flex w-full py-4 bg-white text-[#0B1221] rounded-2xl font-bold justify-center items-center gap-2 transition-all hover:bg-[#F39C12] hover:text-white">
                                Back to login
                            </Link>
                        </div>
                    )}

                    {step !== "success" && (
                        <div className="text-center pt-1">
                            <Link href="/login" className="text-white/60 text-sm hover:text-white flex items-center justify-center gap-2 transition-colors">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Log in
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
