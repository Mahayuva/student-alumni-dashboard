"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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

    const [conversations, setConversations] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const fetchConversations = async () => {
        setLoadingMessages(true);
        try {
            const res = await fetch("/api/messages/conversations");
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const fetchNotifications = async () => {
        setLoadingNotifications(true);
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    useEffect(() => {
        if (showMessages) {
            fetchConversations();
        }
    }, [showMessages]);

    useEffect(() => {
        if (showNotifications) {
            fetchNotifications();
        }
    }, [showNotifications]);

    useEffect(() => {
        if (session) {
            fetchNotifications();
            const interval = setInterval(() => {
                fetchNotifications();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const markAllRead = async () => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ readAll: true })
            });
            if (res.ok) {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Calculate unread status with defined state
    const globalHasUnread = (notifications || []).some(n => !n.isRead);

    // Get initials from user name
    const nameStr = session?.user?.name || "User";
    const initials = nameStr.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

    const getNotificationIcon = (title: string) => {
        if (title.toLowerCase().includes("job")) return { icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-100/50 border-emerald-200" };
        if (title.toLowerCase().includes("event")) return { icon: Calendar, color: "text-primary", bg: "bg-primary-light border-primary/20" };
        if (title.toLowerCase().includes("user")) return { icon: UserIcon, color: "text-blue-500", bg: "bg-blue-100/50 border-blue-200" };
        return { icon: Bell, color: "text-slate-500", bg: "bg-slate-100 border-slate-200" };
    };

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
                            {(conversations || []).some(c => c.unread) && (
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
                                    {loadingMessages ? (
                                        <div className="p-10 text-center text-xs text-slate-400 font-bold animate-pulse">Checking Data...</div>
                                    ) : conversations.length === 0 ? (
                                        <div className="p-10 text-center text-sm text-slate-400 italic">No messages yet.</div>
                                    ) : (
                                        conversations.map(conv => (
                                            <Link 
                                                key={conv.id} 
                                                href={`/${session?.user?.role?.toLowerCase()}/messages/${conv.id}`}
                                                onClick={() => setShowMessages(false)}
                                                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${conv.unread ? "bg-blue-50/30" : ""}`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm shrink-0 shadow-sm border border-primary/10 overflow-hidden">
                                                    {conv.image ? <img src={conv.image} className="w-full h-full object-cover" /> : conv.name?.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <span className={`text-sm truncate pr-2 ${conv.unread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>{conv.name}</span>
                                                        <span className="text-xs text-slate-400 whitespace-nowrap">
                                                            {new Date(conv.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] uppercase tracking-wider font-semibold text-primary/80 mb-1">{conv.role}</div>
                                                    <p className={`text-xs line-clamp-1 leading-relaxed ${conv.unread ? "text-slate-700 font-medium" : "text-slate-500"}`}>
                                                        {conv.lastMessage}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                                <Link 
                                    href={`/${session?.user?.role?.toLowerCase()}/messages`} 
                                    className="block px-4 py-3 text-center text-sm text-primary font-bold hover:bg-primary-light/50 transition-colors border-t border-slate-50"
                                    onClick={() => setShowMessages(false)}
                                >
                                    Open Messenger
                                </Link>
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
                            {globalHasUnread && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800">Notifications</h3>
                                    {globalHasUnread && (
                                        <button 
                                            onClick={markAllRead}
                                            className="text-xs text-primary hover:underline font-medium transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-10 text-center text-sm text-slate-400 italic">No notifications yet.</div>
                                    ) : (
                                        notifications.map(notif => {
                                            const { icon: NotifIcon, color, bg } = getNotificationIcon(notif.title);
                                            return (
                                                <div 
                                                    key={notif.id} 
                                                    onClick={() => { markAsRead(notif.id); if(notif.link) window.location.href = notif.link; }}
                                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4 ${!notif.isRead ? "bg-primary/5" : ""}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${bg} ${color}`}>
                                                        <NotifIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <span className={`text-sm leading-tight ${!notif.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>{notif.title}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1.5">
                                                            {notif.message}
                                                        </p>
                                                        <span className="text-[10px] font-medium text-slate-400">{new Date(notif.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                <div className="px-4 py-3 text-center text-sm text-primary font-bold hover:bg-primary-light/50 transition-colors border-t border-slate-50">
                                    Recent Updates
                                </div>
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
