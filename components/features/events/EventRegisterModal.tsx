"use client";

import { useState } from "react";
import { X, CalendarCheck, Utensils, MessageSquare, Send } from "lucide-react";

interface EventRegisterModalProps {
    eventId: string;
    eventTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EventRegisterModal({ eventId, eventTitle, isOpen, onClose, onSuccess }: EventRegisterModalProps) {
    const [formData, setFormData] = useState({
        remarks: "",
        dietary: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/events/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId, ...formData })
            });
            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const err = await res.text();
                alert(err || "Failed to register");
            }
        } catch (e) {
            alert("Failed to register");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <CalendarCheck className="w-6 h-6 text-indigo-600" />
                            Event Registration
                        </h2>
                        <p className="text-sm text-slate-500">{eventTitle}</p>
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
                                <MessageSquare className="w-4 h-4 text-indigo-600" /> Remarks / Questions for Speaker
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Any specific questions or topics you'd like to hear about?"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Utensils className="w-4 h-4 text-indigo-600" /> Dietary Requirements (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Vegetarian, Nut Allergy"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                value={formData.dietary}
                                onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                            />
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
                            className="flex-1 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isSubmitting ? "Registering..." : (
                                <>
                                    Confirm Registration <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
