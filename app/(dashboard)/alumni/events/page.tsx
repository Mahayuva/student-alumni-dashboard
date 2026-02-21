"use client";

import { EventsList } from "@/components/features/events/EventsList";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AlumniEventsPage() {
    const { data: session } = useSession();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Manage Events</h1>
                <Link href="/alumni/events/create">
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                        <Plus className="w-5 h-5" /> Host an Event
                    </button>
                </Link>
            </div>
            <EventsList isAlumniView={true} />
        </div>
    );
}
