"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, Calendar, GraduationCap, MapPin, Search, Bell, MessageSquare, TrendingUp, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function StudentDashboard() {
    const { data: session } = useSession();

    const [stats, setStats] = useState({
        jobApplications: 0,
        eventsRegistered: 0,
        connections: 0,
        profileViews: 0
    });
    const [activities, setActivities] = useState<any[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [latestJobs, setLatestJobs] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const res = await fetch("/api/student/dashboard");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setActivities(data.activities);
                    setUpcomingEvents(data.upcomingEvents);
                    setLatestJobs(data.latestJobs);
                    setProfile(data.profile);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        }

        if (session) {
            fetchDashboardData();
        }
    }, [session]);

    const statItems = [
        { label: "Job Applications", value: (stats?.jobApplications || 0).toString(), trend: "View All", color: "bg-blue-50 text-blue-600", icon: Briefcase },
        { label: "Events Registered", value: (stats?.eventsRegistered || 0).toString(), trend: "View All", color: "bg-orange-50 text-orange-600", icon: Calendar },
        { label: "Mentors Connected", value: (stats?.connections || 0).toString(), trend: "View All", color: "bg-green-50 text-green-600", icon: Users },
        { label: "Profile Views", value: (stats?.profileViews || 0).toString(), trend: "Coming Soon", color: "bg-purple-50 text-purple-600", icon: TrendingUp },
    ];

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Welcome back, {session?.user?.name?.split(" ")[0] || "Student"}! 👋
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Here's what's happening in your network today</p>
                </div>
                <Link href="/student/skills" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
                    <TrendingUp className="w-4 h-4" /> Analyze Skills
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statItems.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.trend || "Stable"}</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                        <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Profile Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white shadow-lg">
                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden shadow-xl shrink-0">
                        <img
                            src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.email}`}
                            alt="Profile"
                            className="w-full h-full object-cover bg-white"
                        />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                            <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
                            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur-sm border border-white/10">Student</span>
                        </div>
                        <p className="text-blue-100 text-sm mb-4">{profile?.headline || session?.user?.email}</p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {profile?.skills && profile.skills.length > 0 ? (
                                profile.skills.map((skill: string, index: number) => (
                                    <span key={index} className="text-xs bg-white/10 px-3 py-1 rounded-lg border border-white/10">{skill}</span>
                                ))
                            ) : (
                                <>
                                    <span className="text-xs bg-white/10 px-3 py-1 rounded-lg border border-white/10">{profile?.department || "Computer Science"}</span>
                                    <span className="text-xs bg-white/10 px-3 py-1 rounded-lg border border-white/10">{profile?.batch ? `Batch ${profile.batch}` : "Batch 2025"}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div>
                        <Link href="/student/settings" className="px-4 py-2 bg-white text-indigo-600 hover:bg-blue-50 rounded-lg font-medium text-sm transition-colors shadow-sm">
                            Edit Profile
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Activity Feed */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Recent Activity</h3>
                            <button className="text-sm text-indigo-600 font-medium hover:underline">View all &rarr;</button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {activities.map((item, i) => (
                                <div key={i} className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-full shrink-0 ${item.type === 'event' ? 'bg-orange-100 text-orange-600' :
                                            item.type === 'mentorship' ? 'bg-purple-100 text-purple-600' :
                                                item.type === 'job' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {item.type === 'event' ? <Calendar className="w-5 h-5" /> :
                                                item.type === 'mentorship' ? <Users className="w-5 h-5" /> :
                                                    item.type === 'job' ? <Briefcase className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                                    item.status === 'Accepted' ? 'bg-green-100 text-green-600' :
                                                        item.status === 'New' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                                    }`}>{item.status}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                                            <span className="text-xs text-slate-400 mt-2 block">{item.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Latest Jobs Widget */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-400" /> Latest Jobs
                            </h3>
                            <Link href="/student/jobs" className="text-xs text-indigo-600 font-medium hover:underline">View all &rarr;</Link>
                        </div>
                        <div className="space-y-3">
                            {latestJobs.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-2">No active jobs found.</p>
                            ) : (
                                latestJobs.map((job: any) => (
                                    <div key={job.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group">
                                        <div className="flex justify-between">
                                            <h4 className="text-sm font-semibold group-hover:text-indigo-600 truncate">{job.title}</h4>
                                            <span className="text-[10px] text-slate-400">{job.type.replace("_", " ")}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{job.company} • {job.location}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Upcoming Events Widget */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" /> Upcoming Events
                            </h3>
                            <Link href="/student/events" className="text-xs text-indigo-600 font-medium hover:underline">View all &rarr;</Link>
                        </div>
                        <div className="space-y-3">
                            {upcomingEvents.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-2">No upcoming events.</p>
                            ) : (
                                upcomingEvents.map((event: any) => {
                                    const date = new Date(event.date);
                                    const month = date.toLocaleString('default', { month: 'short' });
                                    const day = date.getDate();
                                    return (
                                        <div key={event.id} className="flex gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                                            <div className="bg-indigo-50 text-indigo-600 rounded-lg p-2 text-center min-w-[50px] flex flex-col justify-center">
                                                <span className="text-xs font-bold uppercase">{month}</span>
                                                <span className="text-lg font-bold">{day}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-900 hover:text-indigo-600 line-clamp-1">{event.title}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">{event._count?.registrations || 0} registered</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
