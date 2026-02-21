import { EventsList } from "@/components/features/events/EventsList";

export default function StudentEventsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Upcoming Events</h1>
            </div>
            <EventsList isAlumniView={false} />
        </div>
    );
}
