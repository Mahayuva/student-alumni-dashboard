"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Briefcase, Calendar, Users, TrendingUp, CheckCircle, AlertCircle, FileText, Settings, UserPlus, MapPin, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            const res = await fetch("/api/admin/dashboard");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action: "verify" })
            });
            if (res.ok) {
                toast.success("User approved successfully");
                fetchDashboard();
            }
        } catch (e) {
            toast.error("Failed to approve user");
        }
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center text-slate-500">Loading dashboard...</div>;
    }

    const { stats, pendingApprovals, analytics } = data || { stats: { students: 0, alumni: 0, jobs: 0, events: 0 }, pendingApprovals: [], analytics: { placementRate: 0, dailyActiveUsers: 0 } };

    const displayStats = [
        { label: "Total Students", value: stats.students, trend: "Live", icon: Users, color: "text-blue-600 bg-blue-50" },
        { label: "Total Alumni", value: stats.alumni, trend: "Live", icon: GraduationCap, color: "text-purple-600 bg-purple-50" },
        { label: "Active Jobs", value: stats.jobs, trend: "Live", icon: Briefcase, color: "text-green-600 bg-green-50" },
        { label: "Upcoming Events", value: stats.events, trend: "Live", icon: Calendar, color: "text-orange-600 bg-orange-50" },
    ];

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Institution Dashboard 🏛️
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your alumni network and monitor engagement</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/reports" className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50:bg-slate-700 text-slate-700 shadow-sm flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Reports
                    </Link>
                    <Link href="/admin/events" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Create Event
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayStats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        {stat.trend && <div className="text-xs text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded-md font-medium">{stat.trend}</div>}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Content - Pending Approvals */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-500" /> Pending Approvals
                            </h3>
                            {pendingApprovals.length > 0 && <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">{pendingApprovals.length} pending</span>}
                        </div>
                        <div className="divide-y divide-slate-100">
                            {pendingApprovals.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No pending approvals!</div>
                            ) : (
                                pendingApprovals.map((user: any) => (
                                    <div key={user.id} className="p-4 flex flex-col sm:flex-row items-center gap-4 hover:bg-slate-50:bg-slate-800/20 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-500">
                                            {user.name?.[0] || "?"}
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Alumni Verification</Badge>
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-700">Pending</Badge>
                                            </div>
                                            <h4 className="font-bold text-slate-900 mt-1">{user.name || "Unknown User"}</h4>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApprove(user.id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">Approve</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Placement Analytics */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-500" /> Placement Analytics
                            </h3>
                        </div>
                        <div className="h-40 flex items-end gap-2 justify-between px-4 pb-2 border-b border-slate-100">
                            {/* Mock Chart Bars for visual layout */}
                            {[40, 65, 45, 80, 55, 70, analytics.placementRate].map((h, i) => (
                                <div key={i} className="w-8 bg-blue-100 rounded-t-sm relative group cursor-pointer hover:bg-blue-200:bg-blue-800 transition-colors" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h}%
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4">
                            <div>
                                <div className="text-3xl font-bold text-slate-900">{analytics.placementRate}%</div>
                                <div className="text-xs text-slate-500">Global Target Placement Rate</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-slate-700">Top Recruiters</div>
                                <div className="flex -space-x-2 mt-2 justify-end">
                                    <div className="w-6 h-6 rounded-full bg-red-100 border border-white text-[8px] flex items-center justify-center text-red-700 font-bold">G</div>
                                    <div className="w-6 h-6 rounded-full bg-blue-100 border border-white text-[8px] flex items-center justify-center text-blue-700 font-bold">M</div>
                                    <div className="w-6 h-6 rounded-full bg-orange-100 border border-white text-[8px] flex items-center justify-center text-orange-700 font-bold">A</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Active Metrics */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <h3 className="font-bold text-sm">System Health</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Active Users Today</span>
                                <span className="font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{analytics.dailyActiveUsers}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">New Registrations</span>
                                <span className="font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Live metrics API</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Quick Actions</h3>
                        </div>
                        <div className="space-y-2">
                            <Link href="/admin/users" className="w-full text-left px-4 py-3 rounded-lg border border-slate-100 hover:border-blue-300:border-blue-700 hover:bg-blue-50:bg-blue-900/20 hover:text-blue-700:text-blue-400 transition-colors text-sm font-medium flex items-center gap-2 text-slate-600">
                                <UserPlus className="w-4 h-4" /> Manage Users
                            </Link>
                            <Link href="/admin/jobs" className="w-full text-left px-4 py-3 rounded-lg border border-slate-100 hover:border-blue-300:border-blue-700 hover:bg-blue-50:bg-blue-900/20 hover:text-blue-700:text-blue-400 transition-colors text-sm font-medium flex items-center gap-2 text-slate-600">
                                <Briefcase className="w-4 h-4" /> Moderate Jobs
                            </Link>
                            <Link href="/admin/stories" className="w-full text-left px-4 py-3 rounded-lg border border-slate-100 hover:border-blue-300:border-blue-700 hover:bg-blue-50:bg-blue-900/20 hover:text-blue-700:text-blue-400 transition-colors text-sm font-medium flex items-center gap-2 text-slate-600">
                                <TrendingUp className="w-4 h-4" /> Approve Stories
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper component since I used it above inside but it wasn't defined
function GraduationCap({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    )
}
