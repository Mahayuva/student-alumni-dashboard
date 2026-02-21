"use client";

import { Users } from "lucide-react";

export default function MentorshipMonitorPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Users className="w-8 h-8 text-teal-500" /> Mentorship Monitor
                </h1>
                <p className="text-slate-500 mt-1">Track ongoing mentorship pairs and monitor program health.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                <Users className="w-12 h-12 text-slate-300" />
                <h2 className="text-xl font-semibold text-slate-700">No active pairs</h2>
                <p className="text-slate-500 max-w-sm">No new mentorship connections have been formed yet this semester.</p>
            </div>
        </div>
    );
}
