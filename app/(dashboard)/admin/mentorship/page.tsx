"use client";

import { useEffect, useState } from "react";
import { Users, CheckCircle2, Clock, Activity, MessageSquare, ArrowRight, UserCheck } from "lucide-react";
import { format } from "date-fns";

interface UserInfo {
    name: string;
    email: string;
    image: string | null;
}

interface MentorshipRequest {
    id: string;
    status: string;
    message: string | null;
    createdAt: string;
    mentee: UserInfo;
    mentor: UserInfo;
}

interface Stats {
    total: number;
    accepted: number;
    pending: number;
}

export default function MentorshipMonitorPage() {
    const [data, setData] = useState<MentorshipRequest[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, accepted: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/mentorship")
            .then((res) => res.json())
            .then((json) => {
                setData(json.requests || []);
                setStats(json.stats || { total: 0, accepted: 0, pending: 0 });
            })
            .catch((err) => console.error("Error fetching mentorships", err))
            .finally(() => setLoading(false));
    }, []);

    const StatusBadge = ({ status }: { status: string }) => {
        const variants: Record<string, string> = {
            ACCEPTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
            PENDING: "bg-amber-100 text-amber-700 border-amber-200",
            REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[status] || "bg-slate-100 text-slate-700"}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-900">
                        <UserCheck className="w-8 h-8 text-indigo-600" /> Mentorship Monitor
                    </h1>
                    <p className="text-slate-500 mt-1">Track and analyze connection health between students and alumni.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                    <Activity className="w-4 h-4 animate-pulse" /> Live System Monitor
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: "Total Requests", value: stats.total, icon: MessageSquare, color: "blue" },
                    { label: "Active Pairs", value: stats.accepted, icon: CheckCircle2, color: "emerald" },
                    { label: "Pending Requests", value: stats.pending, icon: Clock, color: "amber" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-slate-800">{stat.value}</div>
                        <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* List of Pairs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="font-bold text-slate-800">Connection History</h2>
                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                        Latest Activities
                    </span>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400 font-medium">Fetching connection data...</p>
                    </div>
                ) : data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Mentee (Student)</th>
                                    <th className="px-6 py-4 text-center"></th>
                                    <th className="px-6 py-4">Mentor (Alumni)</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Requested On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border-2 border-white shadow-sm overflow-hidden font-display">
                                                    {req.mentee.image ? <img src={req.mentee.image} alt="" /> : req.mentee.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{req.mentee.name}</div>
                                                    <div className="text-xs text-slate-500">{req.mentee.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-5 text-center">
                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border-2 border-white shadow-sm overflow-hidden font-display">
                                                    {req.mentor.image ? <img src={req.mentor.image} alt="" /> : req.mentor.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{req.mentor.name}</div>
                                                    <div className="text-xs text-slate-500">{req.mentor.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-500">
                                            {format(new Date(req.createdAt), "MMM d, yyyy")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                        <Users className="w-16 h-16 text-slate-200" />
                        <div>
                            <h3 className="text-lg font-bold text-slate-700">No mentorship pairs found</h3>
                            <p className="text-sm text-slate-500 max-w-sm mt-1 mx-auto">Connections will appear here once students start reaching out to alumni for guidance.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
