"use client";

import EventForm from "@/components/forms/EventForm";

export default function AlumniCreateEventPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Host an Event</h1>
                <p className="text-slate-500 mt-1">Share your knowledge through webinars, workshops, or reunions.</p>
            </div>
            <EventForm redirectPath="/alumni/dashboard" />
        </div>
    );
}
