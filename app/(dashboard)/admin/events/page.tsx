"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, Check, X, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

export default function EventsManagementPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/admin/events");
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const toggleEventStatus = async (id: string, currentStatus: boolean) => {
        const loadingToast = toast.loading("Updating status...");
        try {
            const res = await fetch("/api/admin/events", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isApproved: !currentStatus })
            });

            if (res.ok) {
                toast.success("Event status updated", { id: loadingToast });
                setEvents(events.map(ev =>
                    ev.id === id ? { ...ev, isApproved: !currentStatus } : ev
                ));
            } else {
                toast.error("Update failed", { id: loadingToast });
            }
        } catch (error) {
            toast.error("Update failed", { id: loadingToast });
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event? This will also remove all attendee registrations.")) return;

        const loadingToast = toast.loading("Deleting event...");
        try {
            const res = await fetch(`/api/admin/events?id=${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                toast.success("Event deleted successfully", { id: loadingToast });
                setEvents(events.filter(ev => ev.id !== id));
            } else {
                toast.error("Delete failed", { id: loadingToast });
            }
        } catch (error) {
            toast.error("Delete failed", { id: loadingToast });
        }
    };

    const filteredEvents = events.filter(ev =>
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.postedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Calendar className="w-8 h-8 text-indigo-500" /> Events Management
                </h1>
                <p className="text-slate-500 mt-1">Review, approve, and schedule networking and career events.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search events or organizers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                                <th className="p-4">Event Title</th>
                                <th className="p-4">Organizer</th>
                                <th className="p-4">Event Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading events...</td>
                                </tr>
                            ) : filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">No events found.</td>
                                </tr>
                            ) : (
                                filteredEvents.map(event => (
                                    <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-800">{event.title}</div>
                                            <div className="text-sm text-slate-500 flex gap-2 mt-1">
                                                <span className="capitalize">{event.type.toLowerCase()}</span>
                                                <span>•</span>
                                                <span className="truncate max-w-[200px]">{event.location || event.link || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium text-slate-800">{event.postedBy?.name || "Unknown"}</div>
                                            <div className="text-xs text-slate-500">{event.postedBy?.email}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {new Date(event.date).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={event.isApproved ? "default" : "secondary"} className={event.isApproved ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"}>
                                                {event.isApproved ? "Approved" : "Pending"}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => toggleEventStatus(event.id, event.isApproved)}
                                                    className={`p-2 rounded-lg transition-colors ${event.isApproved
                                                            ? 'text-red-600 hover:bg-red-50 bg-white border border-slate-200'
                                                            : 'text-green-600 hover:bg-green-50 bg-white border border-slate-200'
                                                        }`}
                                                    title={event.isApproved ? "Reject Event" : "Approve Event"}
                                                >
                                                    {event.isApproved ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors bg-white border border-slate-200"
                                                    title="Delete Event"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
