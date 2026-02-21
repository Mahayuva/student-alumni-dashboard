"use client";

import { Badge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "date-fns";
import { Check, X, MessageSquare, User } from "lucide-react";

interface MentorshipRequest {
    id: string;
    status: string;
    message: string;
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

interface MentorshipRequestCardProps {
    request: MentorshipRequest;
    isMentorView?: boolean;
}

export function MentorshipRequestCard({ request, isMentorView = false }: MentorshipRequestCardProps) {
    const otherParty = isMentorView ? request.mentee : request.mentor;
    const timeAgo = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        {otherParty?.image ? (
                            <img src={otherParty.image} alt={otherParty.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-6 h-6 text-slate-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">
                            {otherParty?.name || "Unknown User"}
                        </h3>
                        <p className="text-slate-500 text-sm">{otherParty?.email}</p>
                    </div>
                </div>
                <Badge
                    variant={request.status === "PENDING" ? "secondary" : "default"}
                    className={
                        request.status === "PENDING" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                            request.status === "ACCEPTED" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                                "bg-red-100 text-red-700 hover:bg-red-100"
                    }
                >
                    {request.status}
                </Badge>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                    <p className="text-slate-600 text-sm italic">"{request.message}"</p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-slate-400">Requested {timeAgo}</span>

                {isMentorView && request.status === "PENDING" && (
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                            <X className="w-4 h-4" /> Reject
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                            <Check className="w-4 h-4" /> Accept
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
