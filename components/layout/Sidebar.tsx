"use client";

import { cn } from "@/lib/utils";
import {
    Briefcase,
    Calendar,
    GraduationCap,
    Home,
    LayoutDashboard,
    LogOut,
    MapPin,
    MessageSquare,
    Settings,
    Users,
    User,
    LineChart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const sidebarItems = {
    student: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" },
        { icon: Briefcase, label: "Jobs & Internships", href: "/student/jobs" },
        { icon: Calendar, label: "Events", href: "/student/events" },
        { icon: GraduationCap, label: "Skill Analyser", href: "/student/skills" },
        { icon: Users, label: "Career Guidance", href: "/student/mentors" },
        { icon: MapPin, label: "AlumFinder", href: "/student/map" },
        { icon: User, label: "Batch-wise Alumni", href: "/student/alumni" },
        { icon: MessageSquare, label: "Success Stories", href: "/student/stories" },
        { icon: LineChart, label: "Career Analytics", href: "/student/analytics" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ],
    alumni: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/alumni/dashboard" },
        { icon: Briefcase, label: "Post Jobs", href: "/alumni/jobs/create" },
        { icon: Calendar, label: "Post Events", href: "/alumni/events/create" },
        { icon: Users, label: "Mentorship Requests", href: "/alumni/mentorship" },
        { icon: MapPin, label: "AlumFinder", href: "/alumni/map" },
        { icon: MessageSquare, label: "Submit Story", href: "/alumni/stories/create" },
        { icon: LineChart, label: "Student Insights", href: "/alumni/insights" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ],
    admin: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
        { icon: Users, label: "User Management", href: "/admin/users" },
        { icon: Briefcase, label: "Jobs Moderation", href: "/admin/jobs" },
        { icon: Calendar, label: "Events Management", href: "/admin/events" },
        { icon: MessageSquare, label: "Stories Approval", href: "/admin/stories" },
        { icon: Users, label: "Mentorship Monitor", href: "/admin/mentorship" },
        { icon: MapPin, label: "AlumFinder Control", href: "/admin/map" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ],
};

interface SidebarProps {
    role: "student" | "alumni" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const items = sidebarItems[role];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-30">
            <div className="p-6">
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    AlumniConnect
                </h1>

                {/* User Profile Section */}
                <div className="mb-6 bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt={session.user.name || session?.user?.email || "User"} className="w-full h-full object-cover" />
                        ) : (
                            (session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 text-sm truncate">
                            {session?.user?.name || session?.user?.email?.split("@")[0] || "User"}
                        </span>
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full w-fit font-medium text-white uppercase tracking-wider",
                            role === "student" ? "bg-purple-500" :
                                role === "alumni" ? "bg-blue-500" :
                                    "bg-slate-500"
                        )}>
                            {role}
                        </span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group font-medium",
                                isActive
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 px-6 py-4 w-full text-left text-red-500 hover:bg-red-50 rounded-2xl transition-all hover:shadow-md group"
                >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-bold">Logout</span>
                </button>
            </div>
        </aside >
    );
}
