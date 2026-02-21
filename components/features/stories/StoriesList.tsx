"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";

interface Story {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: {
        name: string | null;
        image: string | null;
        role: string;
    };
}

export function StoriesList() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await fetch("/api/stories");
                if (res.ok) {
                    const data = await res.json();
                    setStories(data);
                }
            } catch (error) {
                console.error("Failed to fetch stories", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    if (loading) {
        return <div className="animate-pulse h-64 bg-slate-100 rounded-xl"></div>;
    }

    if (stories.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">No success stories yet. Be the first to share one!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {stories.map((story) => (
                <div key={story.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                            {story.author.image ? (
                                <img src={story.author.image} alt={story.author.name || "Author"} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{story.title}</h3>
                            <p className="text-xs text-slate-500">By {story.author.name} ({story.author.role})</p>
                        </div>
                    </div>
                    <div className="prose max-w-none text-slate-600 text-sm">
                        <p>{story.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
