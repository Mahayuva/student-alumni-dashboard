"use client";

import { MentorshipList } from "@/components/features/mentorship/MentorshipList";

export default function AlumniMentorshipPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Mentorship Requests</h1>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-blue-800 text-sm">
                    Manage requests from students seeking mentorship. Accept requests to start a chat/mentorship session.
                </p>
            </div>
            <MentorshipList />
        </div>
    );
}
