"use client";

import { MessageSquarePlus, X } from "lucide-react";
import { useState } from "react";

export function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-lg hover:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all z-40 border border-slate-200 dark:border-slate-700"
                title="Send Feedback"
            >
                <MessageSquarePlus className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Feedback</h3>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">What's on your mind?</label>
                                <textarea rows={4} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary outline-none" placeholder="Share your suggestions or report a bug..."></textarea>
                            </div>

                            <button onClick={() => { alert("Feedback sent!"); setIsOpen(false); }} className="w-full py-2 bg-primary text-white rounded-lg font-bold hover:bg-black transition-all shadow-md shadow-primary-shadow">
                                Submit Feedback
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
