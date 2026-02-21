"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Briefcase, Calendar, MessageSquare, UserPlus, Users, Edit, Plus, ExternalLink, X, Check, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { format } from "date-fns";

export default function AlumniDashboard() {
    const { data: session } = useSession();
    const [jobs, setJobs] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [mentorships, setMentorships] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [jobsRes, eventsRes, mentorshipRes] = await Promise.all([
                    fetch("/api/jobs"),
                    fetch("/api/events"),
                    fetch("/api/mentorship")
                ]);

                if (jobsRes.ok) {
                    const jobsData = await jobsRes.json();
                    setJobs(jobsData);
                }

                if (eventsRes.ok) {
                    const eventsData = await eventsRes.json();
                    setEvents(eventsData);
                }

                if (mentorshipRes.ok) {
                    const mentorshipData = await mentorshipRes.json();
                    setMentorships(mentorshipData);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };

        if (session?.user) {
            fetchDashboardData();
        }
    }, [session]);

    const userJobs = jobs; // Alternatively, jobs.filter(j => j.postedById === session?.user?.id); but the prompt implies it should connect to admin as well. Let's just show the jobs fetched.

    const userMentorships = mentorships.filter(m => m.mentorId === session?.user?.id);
    const pendingRequests = userMentorships.filter(m => m.status === "PENDING");
    const activeStudents = userMentorships.filter(m => m.status === "ACCEPTED");

    // Mock data for requests layout
    const stats = [
        { label: "Mentorship Requests", value: pendingRequests.length.toString(), trend: "", icon: UserPlus, color: "bg-purple-50 text-purple-600" },
        { label: "Students Connected", value: activeStudents.length.toString(), trend: "", icon: MessageSquare, color: "bg-blue-50 text-blue-600" },
        { label: "Jobs Posted", value: jobs.length.toString(), trend: "", icon: Briefcase, color: "bg-green-50 text-green-600" },
        { label: "Events Created", value: events.length.toString(), trend: "", icon: Calendar, color: "bg-orange-50 text-orange-600" },
    ];

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Welcome back, {session?.user?.name?.split(" ")[0] || "Alumni"}! 🎓
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Make a difference by guiding the next generation</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/alumni/events/create" className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create Event
                    </Link>
                    <Link href="/alumni/jobs/create" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-blue-200">
                        <Plus className="w-4 h-4" /> Post Job
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        {/* Decorative circle */}
                        <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 ${stat.color.replace('text', 'bg')}`}></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                            <div className={`p-2 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                        {stat.trend && <div className="text-xs text-green-600 font-medium">{stat.trend}</div>}
                    </div>
                ))}
            </div>

            {/* Profile Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg">
                <div className="absolute bottom-0 left-0 w-full h-[50%] bg-white/5 backdrop-blur-sm"></div>
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
                    <div className="w-24 h-24 rounded-full border-4 border-white/40 shadow-xl overflow-hidden bg-white">
                        <img
                            src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.email || "Alumni"}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
                            <span className="bg-white/20 px-3 py-0.5 rounded-full text-xs font-semibold">Alumni</span>
                        </div>
                        <p className="text-blue-100 mb-2">{session?.user?.email}</p>
                        <p className="text-xs text-blue-50 opacity-80 max-w-xl">Connecting with the community of Institute Alumni.</p>
                    </div>
                    <div>
                        <Link href="/settings" className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 block">
                            <Edit className="w-4 h-4" /> Edit Profile
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content - Pending Requests */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-purple-500" /> Pending Mentorship Requests
                            </h3>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">{pendingRequests.length} pending</Badge>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {pendingRequests.map((req) => (
                                <div key={req.id} className="p-5 flex flex-col md:flex-row gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0 overflow-hidden">
                                        <img src={req.mentee?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.mentee?.name || req.menteeId}`} alt={req.mentee?.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h4 className="font-bold text-slate-900">{req.mentee?.name || "Student"}</h4>
                                                <p className="text-xs text-slate-500">{req.mentee?.email || "Student Email"}</p>
                                            </div>
                                            <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50">Pending</Badge>
                                        </div>
                                        {req.message && (
                                            <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                                "{req.message}"
                                            </p>
                                        )}
                                        <div className="flex gap-3 mt-4">
                                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                                                <Check className="w-4 h-4" /> Accept
                                            </button>
                                            <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors">
                                                <MessageSquare className="w-4 h-4" /> Message
                                            </button>
                                            <button className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {pendingRequests.length === 0 && (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    No pending mentorship requests at the moment.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Events List */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Recent Events</h3>
                            <Link href="/alumni/events/create" className="text-sm text-blue-600 font-medium hover:underline">Post &rarr;</Link>
                        </div>
                        <div className="space-y-4">
                            {events.slice(0, 3).map((event: any, idx: number) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full shrink-0 mt-1">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{event.title || "Event"}</p>
                                        <p className="text-xs text-slate-500">{event.location} • {event.date ? format(new Date(event.date), "MMM d, yyyy") : ""}</p>
                                    </div>
                                </div>
                            ))}
                            {events.length === 0 && (
                                <p className="text-sm text-slate-500">No events found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Your Jobs */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-green-500" /> Job Postings
                            </h3>
                            <Link href="/alumni/jobs/create" className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded-md transition-colors">
                                <Plus className="w-3 h-3" /> New
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {userJobs.slice(0, 5).map((job: any, index: number) => (
                                <div key={index} className="p-3 border border-slate-100 bg-white rounded-lg hover:border-blue-200 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{job.title}</h4>
                                        <Badge className={`text-[10px] h-5 ${job.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                                            {job.isActive ? "Open" : "Closed"}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{job.company} • {job.location}</p>
                                    <div className="mt-2 text-[10px] font-medium text-slate-500">
                                        <span className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{job.type}</span>
                                    </div>
                                </div>
                            ))}
                            {userJobs.length === 0 && (
                                <p className="text-sm text-slate-500">No jobs posted yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Impact Overview */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-500" /> Impact Overview
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Students Mentored</span>
                                <span className="font-bold">{activeStudents.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Jobs Filled</span>
                                <span className="font-bold">{userJobs.filter(j => !j.isActive).length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Events Hosted</span>
                                <span className="font-bold">{events.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
