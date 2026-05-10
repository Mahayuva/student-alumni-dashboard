"use client";

import { useState } from "react";
import { X, Send, GraduationCap, FileText, Layout } from "lucide-react";

interface JobApplyModalProps {
    jobId: string;
    jobTitle: string;
    company: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function JobApplyModal({ jobId, jobTitle, company, isOpen, onClose, onSuccess }: JobApplyModalProps) {
    const [formData, setFormData] = useState({
        degree: "",
        skills: "",
        coverNote: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/jobs/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId, ...formData })
            });
            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const err = await res.text();
                alert(err || "Failed to apply");
            }
        } catch (e) {
            alert("Failed to apply");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Apply for Position</h2>
                        <p className="text-sm text-slate-500">{jobTitle} @ {company}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100 shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-primary" /> Degree / Qualification
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. B.Tech Computer Science"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                value={formData.degree}
                                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Layout className="w-4 h-4 text-primary" /> Key Skills & Experience
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. React, Node.js, 2 years experience"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" /> Cover Note / Why should we hire you?
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Tell us more about yourself..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 resize-none"
                                value={formData.coverNote}
                                onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="flex-1 px-6 py-3.5 bg-primary hover:bg-black text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary-shadow flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isSubmitting ? "Submitting..." : (
                                <>
                                    Submit Application <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
