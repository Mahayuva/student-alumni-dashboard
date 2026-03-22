"use client";

import { Bot, Send, X, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
        initialMessages: [
            { id: "1", role: 'assistant', content: "Hi! I'm your AI Career Advisor. I can recommend jobs, analyze your LinkedIn summary, or suggest an alumni mentor to connect with! How can I help today?" }
        ]
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-xl hover:scale-110 transition-all z-50 flex items-center gap-2"
                >
                    <Bot className="w-6 h-6 animate-pulse" />
                    <span className="font-bold hidden md:inline">AI Advisor</span>
                </button>
            )}

            {isOpen && (
                <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AlumniConnect AI</h3>
                                <p className="text-xs text-blue-100">Pro-Level Career Bot</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg: any) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-1">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[80%] p-3.5 rounded-2xl text-[14px] leading-relaxed ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm"
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap break-words">
                                        {msg.content}
                                    </div>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 mt-1">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-1">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white border border-slate-100 text-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Ask me to review your resume or suggest jobs..."
                            className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
                            value={input || ""}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !(input?.trim())}
                            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
