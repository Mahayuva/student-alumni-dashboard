import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { format } from "date-fns";

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
}

interface EventCardProps {
    event: Event;
    isAlumniView?: boolean;
}

export function EventCard({ event, isAlumniView = false }: EventCardProps) {
    const eventDate = new Date(event.date);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden flex flex-col h-full">
            <div className="h-32 bg-gradient-to-r from-primary to-primary/80 relative">
                <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-primary hover:bg-white">{event.type}</Badge>
                </div>
                <div className="absolute -bottom-6 left-6">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center border border-slate-100">
                        <span className="text-xs font-bold text-red-500 uppercase">{format(eventDate, "MMM")}</span>
                        <span className="text-lg font-bold text-slate-900">{format(eventDate, "d")}</span>
                    </div>
                </div>
            </div>

            <div className="pt-8 px-6 pb-6 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {event.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                    {event.description}
                </p>

                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{format(eventDate, "h:mm a")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        {event.location ? (
                            <>
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="truncate">{event.location}</span>
                            </>
                        ) : (
                            <>
                                <Video className="w-4 h-4 text-primary" />
                                <span className="truncate">Online Event</span>
                            </>
                        )}
                    </div>
                </div>

                {isAlumniView ? (
                    <button className="w-full py-2.5 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold hover:bg-primary-light hover:text-primary transition-colors">
                        Manage Event
                    </button>
                ) : (
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch("/api/events/register", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ eventId: event.id })
                                });
                                if (res.ok) {
                                    alert("Registered successfully!");
                                } else {
                                    const err = await res.text();
                                    alert(err || "Registration failed");
                                }
                            } catch (e) {
                                alert("Registration failed");
                            }
                        }}
                        className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-md shadow-primary-shadow"
                    >
                        Register Now
                    </button>
                )}
            </div>
        </div>
    );
}
