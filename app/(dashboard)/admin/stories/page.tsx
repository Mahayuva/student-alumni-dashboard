"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Search, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

export default function StoriesApprovalPage() {
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchStories = async () => {
        try {
            const res = await fetch("/api/admin/stories");
            if (res.ok) {
                const data = await res.json();
                setStories(data);
            }
        } catch (error) {
            toast.error("Failed to load stories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const toggleStoryStatus = async (id: string, currentStatus: boolean) => {
        const loadingToast = toast.loading("Updating status...");
        try {
            const res = await fetch("/api/admin/stories", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isApproved: !currentStatus })
            });

            if (res.ok) {
                toast.success("Story status updated", { id: loadingToast });
                setStories(stories.map(st =>
                    st.id === id ? { ...st, isApproved: !currentStatus } : st
                ));
            } else {
                toast.error("Update failed", { id: loadingToast });
            }
        } catch (error) {
            toast.error("Update failed", { id: loadingToast });
        }
    };

    const filteredStories = stories.filter(st =>
        st.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <MessageSquare className="w-8 h-8 text-pink-500" /> Stories Approval
                </h1>
                <p className="text-slate-500 mt-1">Review and approve inspiring journey stories submitted by your Alumni.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search stories or authors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                                <th className="p-4">Title & Excerpt</th>
                                <th className="p-4">Author</th>
                                <th className="p-4">Submitted Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading stories...</td>
                                </tr>
                            ) : filteredStories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">No stories found.</td>
                                </tr>
                            ) : (
                                filteredStories.map(story => (
                                    <tr key={story.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 max-w-sm">
                                            <div className="font-semibold text-slate-800 line-clamp-1">{story.title}</div>
                                            <div className="text-xs text-slate-500 mt-1 line-clamp-2">{story.content}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium text-slate-800">{story.author?.name || "Unknown"}</div>
                                            <div className="text-xs text-slate-500">{story.author?.email}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {new Date(story.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={story.isApproved ? "default" : "secondary"} className={story.isApproved ? "bg-pink-100 text-pink-700 hover:bg-pink-200 border-pink-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"}>
                                                {story.isApproved ? "Approved" : "Pending"}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => toggleStoryStatus(story.id, story.isApproved)}
                                                    className={`p-2 rounded-lg transition-colors ${story.isApproved
                                                            ? 'text-red-600 hover:bg-red-50 bg-white border border-slate-200'
                                                            : 'text-green-600 hover:bg-green-50 bg-white border border-slate-200'
                                                        }`}
                                                    title={story.isApproved ? "Reject Story" : "Approve Story"}
                                                >
                                                    {story.isApproved ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
