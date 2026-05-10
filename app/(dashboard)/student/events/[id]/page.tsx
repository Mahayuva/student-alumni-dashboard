"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Video, 
    ChevronLeft, 
    CheckCircle2, 
    ArrowRight,
    Share2,
    Bookmark,
    Users,
    MessageSquare,
    Utensils
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { EventRegisterModal } from "@/components/features/events/EventRegisterModal";

interface Event {
    id: string;
    title: string;
    description: string;
    date: string | Date;
    location: string | null;
    link: string | null;
    type: string;
    postedBy: {
        name: string | null;
        image: string | null;
        email: string | null;
        profile?: {
            headline: string | null;
            company: string | null;
        }
    };
    registrations?: {
        id: string;
        createdAt: string | Date;
        remarks?: string | null;
        dietary?: string | null;
    }[];
}

export default function EventDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/events/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvent(data);
                } else {
                    router.push("/student/events");
                }
            } catch (error) {
                console.error("Failed to fetch event", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchEvent();
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse">
                <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
                <div className="h-64 bg-slate-200 rounded-3xl"></div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 h-96 bg-slate-200 rounded-3xl"></div>
                    <div className="h-96 bg-slate-200 rounded-3xl"></div>
                </div>
            </div>
        );
    }

    if (!event) return null;

    const isRegistered = event.registrations && event.registrations.length > 0;
    const registrationData = isRegistered ? event.registrations![0] : null;
    const registrationDate = registrationData ? new Date(registrationData.createdAt) : null;
    const eventDate = new Date(event.date);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Back Button */}
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Events
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                
                <div className="relative flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-100 ring-8 ring-indigo-50">
                        <span className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">{format(eventDate, "MMM")}</span>
                        <span className="text-3xl font-black">{format(eventDate, "d")}</span>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 leading-tight">
                                {event.title}
                            </h1>
                            <Badge className="bg-indigo-50 text-indigo-600 border-none px-4 py-1.5 text-sm font-bold">
                                {event.type}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap gap-y-3 gap-x-6">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                <span>{format(eventDate, "h:mm a")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                {event.location ? (
                                    <>
                                        <MapPin className="w-5 h-5 text-indigo-500" />
                                        <span>{event.location}</span>
                                    </>
                                ) : (
                                    <>
                                        <Video className="w-5 h-5 text-indigo-500" />
                                        <span>Online Webinar</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="p-3 border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                            <Bookmark className="w-6 h-6" />
                        </button>
                        <button className="p-3 border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                            <Share2 className="w-6 h-6" />
                        </button>
                        {isRegistered ? (
                            <div className="flex-1 md:flex-none flex flex-col items-end">
                                <button
                                    disabled
                                    className="w-full px-8 py-4 bg-green-50 text-green-600 border border-green-200 rounded-2xl font-black flex items-center justify-center gap-2 cursor-default"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> Registered
                                </button>
                                <p className="text-[10px] text-slate-400 mt-1.5 font-bold italic">
                                    Confirmed on {format(registrationDate!, "MMM dd, yyyy 'at' hh:mm a")}
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group"
                            >
                                Register Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Your Registration Info */}
                    {isRegistered && (registrationData?.remarks || registrationData?.dietary) && (
                        <section className="bg-indigo-50/50 rounded-[32px] p-6 border border-indigo-100 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Users className="w-6 h-6 text-indigo-600" />
                                Your Registration Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {registrationData.remarks && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" /> Remarks / Questions
                                        </p>
                                        <p className="text-slate-600 text-sm bg-white p-4 rounded-2xl border border-indigo-50 italic">
                                            "{registrationData.remarks}"
                                        </p>
                                    </div>
                                )}
                                {registrationData.dietary && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                            <Utensils className="w-4 h-4" /> Dietary Requirements
                                        </p>
                                        <p className="text-slate-600 text-sm bg-white p-4 rounded-2xl border border-indigo-50 font-bold">
                                            {registrationData.dietary}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    <section className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-6">About the Event</h2>
                        <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {event.description}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100">
                        <h3 className="text-lg font-black mb-6">Event Details</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Date</p>
                                    <p className="font-bold">{format(eventDate, "EEEE, MMM dd")}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Time</p>
                                    <p className="font-bold">{format(eventDate, "h:mm a")}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    {event.location ? <MapPin className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Location</p>
                                    <p className="font-bold">{event.location || "Online Webinar"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Organizer */}
                    <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-slate-900 font-black mb-4">Organizer</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                                {event.postedBy.image ? (
                                    <img src={event.postedBy.image} alt={event.postedBy.name || ""} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <span className="text-indigo-600 font-black">{event.postedBy.name?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-slate-900 truncate">{event.postedBy.name}</p>
                                <p className="text-xs text-slate-500 font-medium truncate">{event.postedBy.profile?.headline || "Alumni Host"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EventRegisterModal 
                eventId={event.id}
                eventTitle={event.title}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={async () => {
                    const res = await fetch(`/api/events/${id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setEvent(data);
                    }
                }}
            />
        </div>
    );
}
