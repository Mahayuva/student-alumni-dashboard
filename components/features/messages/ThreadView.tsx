"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, User as UserIcon, ArrowLeft, MoreVertical, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface ThreadViewProps {
    id: string;
    backUrl: string;
}

export function ThreadView({ id, backUrl }: ThreadViewProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [recipient, setRecipient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch(`/api/users/${id}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setRecipient(userData);
                }

                const msgRes = await fetch(`/api/messages/${id}`);
                if (msgRes.ok) {
                    const msgData = await msgRes.json();
                    setMessages(msgData);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load conversation.");
            } finally {
                setLoading(false);
                setTimeout(scrollToBottom, 500);
            }
        };

        if (session) {
            fetchData();
        }
    }, [id, session]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const temporaryId = Date.now().toString();
        const pendingMsg = {
            id: temporaryId,
            content: newMessage,
            senderId: session?.user?.id,
            createdAt: new Date().toISOString(),
            pending: true
        };

        setMessages(prev => [...prev, pendingMsg]);
        setNewMessage("");
        setTimeout(scrollToBottom, 500);

        try {
            const res = await fetch(`/api/messages/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newMessage }),
            });

            if (res.ok) {
                const sentMsg = await res.json();
                setMessages(prev => prev.map(m => m.id === temporaryId ? sentMsg : m));
            }
        } catch (error) {
            toast.error("Failed to send message.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium tracking-tight">Securing direct channel...</p>
        </div>
    );

    return (
        <div className="fixed inset-0 lg:left-[272px] top-24 bg-white z-20 flex flex-col items-center">
            <div className="w-full h-full flex flex-col bg-[#FAFBFF]">
                <div className="w-full px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 shadow-sm z-30">
                    <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href={backUrl} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-primary">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black overflow-hidden shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                                        {recipient?.image ? (
                                            <img src={recipient.image} alt={recipient.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl">{recipient?.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                                </div>
                                <div>
                                    <h2 className="font-black text-slate-900 text-lg tracking-tight">{recipient?.name || "Member"}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/5">Authenticated</span>
                                        <span className="text-[10px] text-slate-400 font-bold tracking-tight">• Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50/50 border border-green-100 rounded-xl">
                                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Encrypted</span>
                            </div>
                            <button className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px]">
                    <div className="max-w-4xl mx-auto w-full px-6 py-10 space-y-10">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 mt-20">
                                <div className="w-20 h-20 bg-white text-primary rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-primary/10 border border-slate-100">
                                    <UserIcon className="w-10 h-10" />
                                </div>
                                <h3 className="font-black text-2xl text-slate-900 tracking-tight">Direct Messaging</h3>
                                <p className="text-slate-500 mt-3 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                                    You can now chat directly with <span className="text-primary font-black">{recipient?.name}</span>. Start by sending a professional message.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={msg.id || idx} className={`flex flex-col ${msg.senderId === session?.user?.id ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[85%] md:max-w-[75%] px-6 py-4 rounded-[1.5rem] text-[15px] leading-relaxed shadow-sm transition-all ${
                                        msg.senderId === session?.user?.id 
                                            ? 'bg-primary text-white rounded-tr-none hover:shadow-xl hover:shadow-primary/20' 
                                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                    }`}>
                                        <p className="font-medium">{msg.content}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 mt-2.5 px-1 transition-opacity opacity-0 group-hover:opacity-100 ${msg.senderId === session?.user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {msg.senderId === session?.user?.id && (
                                            <span className={`text-[10px] font-black tracking-widest ${msg.pending ? 'text-slate-300' : 'text-primary'}`}>
                                                {msg.pending ? 'PENDING' : 'SENT'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="p-8 bg-white shrink-0 border-t border-slate-100 mt-auto">
                    <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                        <div className="flex items-end gap-4 bg-slate-50 border-2 border-slate-100 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 rounded-[2rem] px-6 py-3 transition-all">
                            <textarea
                                rows={1}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e as any);
                                    }
                                }}
                                placeholder="Type your message here..."
                                className="flex-1 bg-transparent py-3 text-sm font-bold outline-none placeholder:text-slate-400 resize-none max-h-40"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className={`p-4 rounded-2xl mb-1.5 transition-all flex-shrink-0 ${
                                    newMessage.trim() 
                                        ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95' 
                                        : 'bg-slate-200 text-white'
                                }`}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
