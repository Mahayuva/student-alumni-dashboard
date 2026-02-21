"use client";

import { Bell, Search, User } from "lucide-react";
import { ThemeCustomizer } from "@/components/features/shared/ThemeCustomizer";
import { useSession } from "next-auth/react";

export function Navbar() {
    const { data: session } = useSession();

    // Get initials from user name, or default to generic User icon or '??'
    const nameStr = session?.user?.name || "User";
    const initials = nameStr.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

    return (
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-96 max-w-full hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <ThemeCustomizer />
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div
                    className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm cursor-pointer hover:bg-slate-200 transition-colors"
                    title={session?.user?.name || "Profile"}
                >
                    {initials}
                </div>
            </div>
        </header>
    );
}
