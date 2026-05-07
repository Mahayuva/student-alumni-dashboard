"use client";

import { useEffect, useState } from "react";
import { MentorshipRequestCard } from "./MentorshipRequestCard";
import { useSession } from "next-auth/react";

interface MentorshipRequest {
    id: string;
    status: string;
    message: string;
    menteeId: string;
    mentorId: string;
    createdAt: string | Date;
    mentee?: {
        name: string | null;
        image: string | null;
        email: string | null;
    };
    mentor?: {
        name: string | null;
        image: string | null;
        email: string | null;
    };
}

export function MentorshipList() {
    const { data: session } = useSession();
    const [requests, setRequests] = useState<MentorshipRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const isMentor = session?.user?.role === "ALUMNI";

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await fetch("/api/mentorship");
                if (res.ok) {
                    const data = await res.json();
                    setRequests(data);
                }
            } catch (error) {
                console.error("Failed to fetch mentorship requests", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchRequests();
        }
    }, [session]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">No mentorship requests found.</p>
                {!isMentor && (
                    <p className="text-sm text-slate-400 mt-2">Browse the Alumni directory to find a mentor!</p>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((request) => (
                <MentorshipRequestCard key={request.id} request={request} isMentorView={isMentor} />
            ))}
        </div>
    );
}
