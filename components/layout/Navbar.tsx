"use client";

import { Bell, Search, User, MessageSquare } from "lucide-react";
import { ThemeCustomizer } from "@/components/features/shared/ThemeCustomizer";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    // Get initials from user name, or default to generic User icon or '??'
    const nameStr = session?.user?.name || "User";
    const initials = nameStr.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

    return (
        <header className="h-24 bg-transparent sticky top-0 z-20 px-12 flex items-center justify-between">
            <div className="flex items-center gap-12 flex-1">

                <div className="relative w-full max-w-sm ml-0 group hidden lg:block">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-8 pr-4 py-2 bg-transparent border-b border-slate-300 focus:border-primary transition-all text-sm outline-none placeholder:text-slate-400 font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <ThemeCustomizer />
                    <button className="p-2 text-slate-500 hover:text-slate-900 transition-all relative group">
                        <MessageSquare className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-900 transition-all relative group" title="Notifications">
                        <Bell className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full border border-white"></span>
                    </button>
                </div>
                
                <div
                    className="flex items-center gap-4 cursor-pointer group"
                    title={session?.user?.name || "Profile"}
                >
                    <div className="h-10 w-10 rounded-full bg-white border-2 border-white shadow-md shadow-black/5 flex items-center justify-center text-slate-700 font-bold text-sm overflow-hidden group-hover:scale-105 transition-transform">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt={session.user.name || "Profile"} className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
