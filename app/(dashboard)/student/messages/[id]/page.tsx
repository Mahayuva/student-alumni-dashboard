"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, User as UserIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function StudentMessagePage({ params }: { params: { id: string } }) {
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
                // Fetch recipient info
                const userRes = await fetch(`/api/users/${params.id}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setRecipient(userData);
                }

                // Fetch messages
                const msgRes = await fetch(`/api/messages/${params.id}`);
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
    }, [params.id, session]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await fetch(`/api/messages/${params.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newMessage }),
            });

            if (res.ok) {
                const sentMsg = await res.json();
                setMessages(prev => [...prev, sentMsg]);
                setNewMessage("");
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            toast.error("Failed to send message.");
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading conversation...</div>;

    return (
        <div className="flex flex-col h-[75vh] max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden backdrop-blur-xl bg-white/80">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                <Link href="/student/alumni" className="p-2 hover:bg-white rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-400" />
                </Link>
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-100">
                    {recipient?.image ? (
                        <img src={recipient.image} alt={recipient.name} className="w-full h-full object-cover" />
                    ) : (
                        recipient?.name?.charAt(0) || <UserIcon />
                    )}
                </div>
                <div>
                    <h2 className="font-bold text-slate-900">{recipient?.name || "Chat"}</h2>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Connection</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/20">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                            <Send className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-slate-900">Start a Conversation</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-xs">You are now connected! Say hello and start your mentorship journey.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                                msg.senderId === session?.user?.id 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                            }`}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <span className={`text-[10px] mt-2 block opacity-60 ${msg.senderId === session?.user?.id ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 flex gap-4">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-3.5 rounded-2xl hover:bg-black transition-all shadow-lg shadow-blue-200 hover:shadow-black/20 hover:-translate-y-0.5 active:scale-95"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
