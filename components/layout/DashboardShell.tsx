"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Chatbot } from "@/components/features/shared/Chatbot";
import { FeedbackButton } from "@/components/features/shared/FeedbackButton";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    let role: "student" | "alumni" | "admin" = "student";

    // First try to get role from session
    if (session?.user?.role) {
        role = session.user.role.toLowerCase() as "student" | "alumni" | "admin";
    } else {
        // Fallback to URL path
        if (pathname.startsWith("/alumni")) role = "alumni";
        if (pathname.startsWith("/admin")) role = "admin";
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar role={role} />
            <div className="flex-1 ml-64 flex flex-col relative">
                <Navbar />
                <main className="flex-1 p-6">{children}</main>
            </div>

            {/* Global Features */}
            <Chatbot />
            <FeedbackButton />
        </div>
    );
}
