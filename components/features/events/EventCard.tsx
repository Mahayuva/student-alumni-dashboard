"use client";

import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock, MapPin, Video, CheckCircle2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import Link from "next/link";
import { EventRegisterModal } from "./EventRegisterModal";

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
    };
    registrations?: {
        id: string;
        createdAt: string | Date;
    }[];
}

interface EventCardProps {
    event: Event;
    isAlumniView?: boolean;
}

export function EventCard({ event, isAlumniView = false }: EventCardProps) {
    const [isRegistered, setIsRegistered] = useState(event.registrations && event.registrations.length > 0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const eventDate = new Date(event.date);

    const handleRegisterSuccess = () => {
        setIsRegistered(true);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col h-full">
            <div className="h-32 bg-indigo-600 relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[size:20px_20px]"></div>
                
                <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-white/90 text-indigo-600 hover:bg-white border-none backdrop-blur-sm">{event.type}</Badge>
                </div>
                <div className="absolute -bottom-6 left-6 z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex flex-col items-center justify-center border border-slate-100 ring-4 ring-white/10">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter leading-none mb-0.5">{format(eventDate, "MMM")}</span>
                        <span className="text-xl font-black text-slate-900 leading-none">{format(eventDate, "d")}</span>
                    </div>
                </div>
            </div>

            <div className="pt-10 px-6 pb-6 flex-1 flex flex-col">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {event.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {event.description}
                    </p>

                    <div className="space-y-2.5 mb-6">
                        <div className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-indigo-500" />
                            </div>
                            <span>{format(eventDate, "h:mm a")}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                {event.location ? <MapPin className="w-4 h-4 text-indigo-500" /> : <Video className="w-4 h-4 text-indigo-500" />}
                            </div>
                            <span className="truncate">{event.location || "Online Event"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {isAlumniView ? (
                        <button className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100">
                            Manage Event
                        </button>
                    ) : isRegistered ? (
                        <button
                            disabled
                            className="flex-1 py-3 bg-green-50 text-green-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-green-100 cursor-default"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Registered
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center"
                        >
                            Register Now
                        </button>
                    )}
                    <Link 
                        href={`/student/events/${event.id}`}
                        className="px-4 py-3 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center group/btn"
                        title="View Details"
                    >
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            <EventRegisterModal 
                eventId={event.id}
                eventTitle={event.title}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleRegisterSuccess}
            />
        </div>
    );
}

