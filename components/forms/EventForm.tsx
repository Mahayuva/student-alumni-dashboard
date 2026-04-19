"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar as CalendarIcon, MapPin, Users } from "lucide-react";
import toast from "react-hot-toast";

const eventSchema = z.object({
    title: z.string().min(3, "Event title is required"),
    type: z.enum(["Webinar", "Workshop", "Meetup", "Reunion", "Conference"]),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    location: z.string().min(2, "Location is required"),
    description: z.string().min(20, "Please provide a detailed description"),
    capacity: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
    redirectPath: string;
}

export default function EventForm({ redirectPath }: EventFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
    });

    const onSubmit = async (data: EventFormValues) => {
        try {
            const payload = {
                ...data,
                type: data.type.toUpperCase(),
                date: new Date(`${data.date}T${data.time}`).toISOString(),
                capacity: data.capacity ? parseInt(data.capacity) : undefined,
            };

            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            toast.success("Event Created Successfully!");
            window.location.href = redirectPath;
        } catch (error) {
            console.error("Failed to create event:", error);
            toast.error("Failed to create event. Please try again.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Event Title</label>
                        <input
                            {...register("title")}
                            placeholder="e.g. Intro to Data Science Webinar"
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Event Type</label>
                            <select
                                {...register("type")}
                                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="Webinar">Webinar</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Meetup">Meetup</option>
                                <option value="Reunion">Reunion</option>
                                <option value="Conference">Conference</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Capacity (Optional)</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    {...register("capacity")}
                                    placeholder="e.g. 100"
                                    className="w-full pl-10 p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    {...register("date")}
                                    className="w-full pl-10 p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Time</label>
                            <input
                                type="time"
                                {...register("time")}
                                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            {errors.time && <p className="text-red-500 text-xs">{errors.time.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location / Link</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input
                                {...register("location")}
                                placeholder="e.g. Auditorium A or Zoom Link"
                                className="w-full pl-10 p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Event Description</label>
                        <textarea
                            {...register("description")}
                            rows={4}
                            placeholder="What is this event about?"
                            className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "Creating..." : "Create Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
