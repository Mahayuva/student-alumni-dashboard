"use client";

import { useState, useEffect } from "react";
import { Search, PenTool, Heart, MessageCircle, Share2, X, Plus } from "lucide-react";

export default function SuccessStoriesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchStories = async () => {
        try {
            const res = await fetch("/api/stories");
            if (res.ok) {
                const data = await res.json();
                setStories(data);
            }
        } catch (error) {
            console.error("Failed to load stories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/stories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content })
            });
            if (res.ok) {
                setIsModalOpen(false);
                setTitle("");
                setContent("");
                fetchStories(); // Refresh list
            } else {
                alert("Failed to post story. Check length requirements (Title: 5+, Content: 20+)");
            }
        } catch (error) {
            console.error("Error posting story:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-900">
                        <span className="text-yellow-500">⭐</span> Success Stories
                    </h1>
                    <p className="text-slate-500 mt-1">Get inspired by alumni journeys</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Submit Story
                </button>
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-10 text-center text-slate-500">Loading stories...</div>
                ) : stories.map(story => (
                    <div key={story.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                                    <img src={story.author?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.author?.name || "User"}`} alt={story.author?.name || "Author"} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900">{story.author?.name || "Anonymous Member"}</h4>
                                    <p className="text-xs text-slate-500 capitalize">{story.author?.role?.toLowerCase() || "Alumni"}</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">{story.title}</h3>
                            <p className="text-slate-600 text-sm line-clamp-4 mb-4">{story.content}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded-md border border-slate-100">#Journey</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                            <div className="flex gap-4">
                                <button className="flex items-center gap-1 hover:text-red-500 transition-colors"><Heart className="w-4 h-4" /> 0</button>
                                <button className="flex items-center gap-1 hover:text-blue-500 transition-colors"><MessageCircle className="w-4 h-4" /> 0</button>
                            </div>
                            <button className="hover:text-slate-800 transition-colors"><Share2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}

                {/* Placeholder for "No stories yet" if empty */}
                {!loading && stories.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400">
                        <PenTool className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No success stories yet. Be the first to share one!</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">Share Your Success Story</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. My Journey to..."
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Your Story</label>
                                    <textarea
                                        rows={5}
                                        required
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        placeholder="Share your experience, challenges, and advice (min 20 chars)..."
                                    />
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all disabled:opacity-50">
                                    {isSubmitting ? "Posting..." : "Submit Story"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
