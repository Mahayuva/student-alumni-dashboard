"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, MessageSquare, Calendar, Briefcase, User as UserIcon } from "lucide-react";
import { ThemeCustomizer } from "@/components/features/shared/ThemeCustomizer";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const [showMessages, setShowMessages] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const msgsRef = useRef<HTMLDivElement>(null);
    const notifsRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (msgsRef.current && !msgsRef.current.contains(event.target as Node)) {
                setShowMessages(false);
            }
            if (notifsRef.current && !notifsRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Get initials from user name
    const nameStr = session?.user?.name || "User";
    const initials = nameStr.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

    const mockMessages = [
        { id: 1, sender: "Sarah Jenkins", role: "Alumni • Tech Lead", text: "Are you available for a mock interview this Friday? I can help you prepare for the Google round.", time: "2h ago", unread: true, avatar: "SJ" },
        { id: 2, sender: "Dr. Robert Smith", role: "Professor", text: "Your project abstract looks great. Proceed with the implementation phase.", time: "5h ago", unread: true, avatar: "RS" },
        { id: 3, sender: "Emily Chen", role: "Student", text: "Thanks for sharing the resources for the web dev course! Highly appreciated.", time: "1d ago", unread: false, avatar: "EC" },
    ];

    const mockNotifications = [
        { id: 1, title: "Mentorship Request Accepted", desc: "Sarah Jenkins accepted your request.", time: "10m ago", icon: UserIcon, color: "text-blue-500", bg: "bg-blue-100/50 border-blue-200" },
        { id: 2, title: "Upcoming Event", desc: "Annual Alumni Meetup starts in 2 days. Don't forget to RSVP.", time: "2h ago", icon: Calendar, color: "text-primary", bg: "bg-primary-light border-primary/20" },
        { id: 3, title: "New Job Posting", desc: "Google posted a Junior Developer role matching your skills.", time: "5h ago", icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-100/50 border-emerald-200" },
    ];

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
                <div className="flex items-center gap-4">
                    <ThemeCustomizer />
                    
                    {/* Messages Dropdown */}
                    <div className="relative" ref={msgsRef}>
                        <button 
                            onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }}
                            className={`p-2 transition-all relative group ${showMessages ? "text-primary" : "text-slate-500 hover:text-slate-900"}`}
                        >
                            <MessageSquare className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                            {mockMessages.some(m => m.unread) && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>
                        
                        {showMessages && (
                            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800">Messages</h3>
                                    <button className="text-xs text-primary font-semibold hover:underline">Mark all read</button>
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    {mockMessages.map(msg => (
                                        <div key={msg.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${msg.unread ? "bg-blue-50/30" : ""}`}>
                                            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm shrink-0 shadow-sm border border-primary/10">
                                                {msg.avatar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className={`text-sm truncate pr-2 ${msg.unread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>{msg.sender}</span>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap">{msg.time}</span>
                                                </div>
                                                <div className="text-[10px] uppercase tracking-wider font-semibold text-primary/80 mb-1">{msg.role}</div>
                                                <p className={`text-xs line-clamp-2 leading-relaxed ${msg.unread ? "text-slate-700 font-medium" : "text-slate-500"}`}>
                                                    {msg.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <a href="#" className="block px-4 py-3 text-center text-sm text-primary font-bold hover:bg-primary-light/50 transition-colors border-t border-slate-50">
                                    Open Messenger
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Notifications Dropdown */}
                    <div className="relative" ref={notifsRef}>
                        <button 
                            onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }}
                            className={`p-2 transition-all relative group ${showNotifications ? "text-primary" : "text-slate-500 hover:text-slate-900"}`}
                        >
                            <Bell className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800">Notifications</h3>
                                    <button className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors">Settings</button>
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    {mockNotifications.map(notif => (
                                        <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${notif.bg} ${notif.color}`}>
                                                <notif.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <span className="text-sm font-semibold text-slate-900 leading-tight">{notif.title}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1.5">
                                                    {notif.desc}
                                                </p>
                                                <span className="text-[10px] font-medium text-slate-400">{notif.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <a href="#" className="block px-4 py-3 text-center text-sm text-primary font-bold hover:bg-primary-light/50 transition-colors border-t border-slate-50">
                                    View all notifications
                                </a>
                            </div>
                        )}
                    </div>
                </div>
                
                <div
                    className="flex items-center gap-4 cursor-pointer group pl-4 border-l border-slate-200"
                    title={session?.user?.name || "Profile"}
                >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-100 to-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 font-bold text-sm overflow-hidden group-hover:scale-105 group-hover:shadow-md transition-all">
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
