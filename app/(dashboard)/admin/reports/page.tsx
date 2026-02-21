"use client";

import { FileText } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <FileText className="w-8 h-8 text-orange-500" /> Institution Reports
                </h1>
                <p className="text-slate-500 mt-1">Export analytical reports regarding placements and event attendance.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
                <FileText className="w-12 h-12 text-slate-300" />
                <h2 className="text-xl font-semibold text-slate-700">Reports Module Initializing</h2>
                <p className="text-slate-500 max-w-sm">The new reporting system is currently gathering baseline metrics. Please check back next week.</p>
            </div>
        </div>
    );
}
