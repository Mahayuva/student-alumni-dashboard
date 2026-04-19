"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Search, MessageSquare, Clock, User as UserIcon, Send } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export function ConversationList() {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchConversations = async () => {
        try {
            const res = await fetch("/api/messages/conversations");
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchConversations();
        }
    }, [session]);

    const filteredConversations = conversations.filter(c => 
        c.name?.toLowerCase().includes(search.toLowerCase())
    );

    const userRole = session?.user?.role?.toLowerCase();

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        My Messages
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Continue your mentorship discussions and professional networking.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading secure chats...</div>
            ) : filteredConversations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    {filteredConversations.map(conv => (
                        <Link 
                            key={conv.id}
                            href={`/${userRole}/messages/${conv.id}`}
                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group flex items-center gap-6"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary font-bold text-2xl border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                                    {conv.image ? <img src={conv.image} className="w-full h-full object-cover" /> : conv.name?.charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-lg truncate">{conv.name}</h3>
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                            {new Date(conv.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-primary/5 text-primary border-primary/10 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                        {conv.role}
                                    </Badge>
                                    {conv.unread && (
                                        <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest">
                                            New Message
                                        </span>
                                    )}
                                </div>

                                <p className="text-slate-500 text-[14px] leading-relaxed truncate pr-10">
                                    {conv.lastMessage}
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all text-slate-400">
                                <Send className="w-5 h-5 rotate-45" />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No conversations yet</h3>
                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">Connect with alumni or mentors to start your networking journey.</p>
                    <Link 
                        href={`/${userRole}/alumni`} 
                        className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                        Find Mentors
                    </Link>
                </div>
            )}
        </div>
    );
}
