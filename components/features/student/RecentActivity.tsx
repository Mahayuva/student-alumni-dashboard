"use client";

import { Badge } from "@/components/ui/Badge";
import { Calendar, CheckCircle2, Clock, UserPlus, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Activity {
    id: string;
    type: "event" | "mentorship" | "job";
    title: string;
    date: string;
    status: string;
    color?: string;
    icon?: any;
}

export function RecentActivity() {
    const { data: session, status } = useSession();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            setLoading(false);
            return;
        }

        const fetchActivities = async () => {
            try {
                const res = await fetch("/api/user/activity");
                if (res.ok) {
                    const data = await res.json();
                    // Process data to add icons/colors
                    const processed = data.map((item: any) => {
                        let icon = Info;
                        let color = "text-slate-600 bg-slate-100";

                        if (item.type === "event") {
                            icon = Calendar;
                            color = "text-orange-600 bg-orange-100";
                        } else if (item.type === "mentorship") {
                            icon = UserPlus;
                            color = "text-primary bg-primary-light";
                        } else if (item.type === "job") {
                            icon = CheckCircle2;
                            color = "text-green-600 bg-green-100";
                        }

                        // Format date
                        const dateObj = new Date(item.date);
                        const dateStr = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return { ...item, icon, color, formattedDate: dateStr };
                    });
                    setActivities(processed);
                }
            } catch (error) {
                console.error("Failed to fetch activities", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchActivities();
        }
    }, [session, status]);

    return (
        <div className="glass-card rounded-3xl p-6 h-full border-none bg-white/50 backdrop-blur-sm shadow-sm border border-slate-200">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800">
                <div className="p-2 bg-primary-light rounded-lg text-primary">
                    <Clock className="w-5 h-5" />
                </div>
                Recent Activities
            </h3>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : activities.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                    <p>No recent activity.</p>
                </div>
            ) : (
                <div className="space-y-6 relative ml-3 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-primary/20 before:rounded-full pl-6">
                    {activities.map((activity) => {
                        const Icon = activity.icon || Info;
                        return (
                            <div key={activity.id} className="relative group">
                                <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${activity.status === "CONFIRMED" || activity.status === "ACCEPTED" ? "bg-green-500" :
                                    activity.status === "PENDING" ? "bg-amber-500" : "bg-primary"
                                    }`}></div>

                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:scale-[1.02] transition-all cursor-default">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className={`text-[10px] font-bold border-0 px-2 py-0.5 rounded-md ${activity.color} bg-opacity-10`}>
                                            {activity.type.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs font-medium text-slate-400">{(activity as any).formattedDate}</span>
                                    </div>

                                    <p className="font-bold text-slate-800 leading-snug mb-2 group-hover:text-primary transition-colors">{activity.title}</p>

                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${activity.status === "CONFIRMED" || activity.status === "ACCEPTED" ? "text-green-700 bg-green-50" :
                                            activity.status === "PENDING" ? "text-amber-700 bg-amber-50" : "text-primary bg-primary-light"
                                            }`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <button className="w-full mt-8 py-3.5 text-sm font-bold text-primary bg-primary-light hover:bg-primary hover:text-white transition-all hover:shadow-sm rounded-xl">
                View All History
            </button>
        </div>
    );
}
