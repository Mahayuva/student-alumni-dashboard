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
        { icon: MessageSquare, label: "My Messages", href: "/student/messages" },
        { icon: Briefcase, label: "Jobs & Internships", href: "/student/jobs" },
        { icon: Calendar, label: "Events", href: "/student/events" },
        { icon: GraduationCap, label: "Skill Analyser", href: "/student/skills" },
        { icon: Users, label: "Career Guidance", href: "/student/mentors" },
        { icon: MapPin, label: "AlumFinder", href: "/student/map" },
        { icon: User, label: "Batch-wise Alumni", href: "/student/alumni" },
        { icon: MessageSquare, label: "Success Stories", href: "/student/stories" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ],
    alumni: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/alumni/dashboard" },
        { icon: MessageSquare, label: "My Messages", href: "/alumni/messages" },
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
        // { icon: MessageSquare, label: "My Messages", href: "/admin/messages" },
        { icon: Users, label: "User Management", href: "/admin/users" },
        { icon: Briefcase, label: "Jobs Moderation", href: "/admin/jobs" },
        { icon: Calendar, label: "Events Management", href: "/admin/events" },
        { icon: MessageSquare, label: "Stories Approval", href: "/admin/stories" },
        { icon: Users, label: "Mentorship Monitor", href: "/admin/mentorship" },
        { icon: MapPin, label: "Community Directory", href: "/admin/alumni" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ],
    institute: [
        { icon: LayoutDashboard, label: "Dashboard", href: "/institute/dashboard" },
        { icon: MessageSquare, label: "My Messages", href: "/institute/messages" },
        { icon: Users, label: "User Management", href: "/institute/users" },
        { icon: User, label: "Alumni Directory", href: "/institute/alumni" },
        { icon: Briefcase, label: "Job Moderation", href: "/institute/jobs" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ],
};

interface SidebarProps {
    role: "student" | "alumni" | "admin" | "institute";
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const items = sidebarItems[role];

    return (
        <aside className="w-[272px] bg-white/50 border-r border-white/30 h-screen flex flex-col fixed left-0 top-0 z-30 backdrop-blur-xl">
            <div className="p-8 pb-4">
                <h1 className="text-xl font-bold flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-black/10">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-900 flex items-center gap-1.3">
                        Alumsphere
                    </span>
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group text-sm font-medium",
                                isActive
                                    ? "bg-white text-slate-900 shadow-sm shadow-black/5 ring-1 ring-black/5"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-primary-light"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-slate-900 fill-slate-900/10" : "text-slate-400 group-hover:text-slate-600")} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-8 mt-auto">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-all font-semibold group text-sm"
                >
                    <LogOut className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
