"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Chatbot } from "@/components/features/shared/Chatbot";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    let role: "student" | "alumni" | "admin" | "institute" = "student";

    // First try to get role from session
    if (session?.user?.role) {
        role = session.user.role.toLowerCase() as any;
    } else {
        // Fallback to URL path
        if (pathname.startsWith("/alumni")) role = "alumni";
        if (pathname.startsWith("/admin")) role = "admin";
        if (pathname.startsWith("/institute")) role = "institute";
    }

    return (
        <div className="min-h-screen bg-[#F0F4F8] flex relative overflow-hidden">
            {/* Soft decorative background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none"></div>
            
            <Sidebar role={role} />
            <div className="flex-1 ml-[272px] flex flex-col relative overflow-hidden">
                <Navbar />
                <main className="flex-1 p-10 overflow-y-auto custom-scrollbar relative z-10">
                    <div className="max-w-7xl mx-auto space-y-10">
                        {children}
                    </div>
                </main>
            </div>

            {/* Global Features */}
            <Chatbot />
        </div>
    );
}
