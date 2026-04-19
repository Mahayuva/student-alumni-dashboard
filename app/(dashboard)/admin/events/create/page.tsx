"use client";

import EventForm from "@/components/forms/EventForm";

export default function AdminCreateEventPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Create Institutional Event</h1>
                <p className="text-slate-500 mt-1">Organize career fairs, guest lectures, or campus meetups.</p>
            </div>
            <EventForm redirectPath="/admin/dashboard" />
        </div>
    );
}
