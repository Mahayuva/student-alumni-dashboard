"use client";

import { Badge } from "@/components/ui/Badge";
import { Github, Linkedin, Mail, MapPin, Twitter, Globe, Edit } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Profile {
    bio?: string;
    headline?: string;
    city?: string;
    country?: string;
    skills?: string[];
    batch?: string;
    department?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
}

export function ProfileCard() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchProfile();
        }
    }, [session, status]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 h-full flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm h-full flex flex-col">
            {/* Professional Cover Image */}
            <div className="h-32 bg-slate-800 relative">
                {/* Optional: Add a subtle pattern or keep clean slate */}
            </div>

            <div className="px-6 pb-6 flex-1 flex flex-col relative">
                <div className="flex justify-between items-end -mt-10 mb-4">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden flex items-center justify-center text-slate-900 border-slate-100">
                            {session?.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold uppercase truncate">
                                    {session?.user?.name?.charAt(0) || "U"}
                                </span>
                            )}
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors shadow-sm mb-2 flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Edit Profile
                    </button>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{session?.user?.name || "Welcome!"}</h2>
                    <p className="text-slate-500 font-medium text-sm mb-4">
                        {profile?.headline || `${profile?.department || 'Student'} • Batch ${profile?.batch || '202X'}`}
                    </p>

                    <div className="flex flex-col gap-2 text-sm text-slate-600 mb-6">
                        {(profile?.city || profile?.country) && (
                            <span className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" /> {profile.city}{profile.city && profile.country ? ", " : ""}{profile.country}
                            </span>
                        )}
                        <span className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" /> {session?.user?.email}
                        </span>
                    </div>

                    {profile?.bio && (
                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                            {profile.bio}
                        </p>
                    )}

                    {profile?.skills && profile.skills.length > 0 && (
                        <>
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills</h4>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {profile.skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 font-normal hover:bg-slate-200">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 text-slate-400 mt-auto">
                        {profile?.github && <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors"><Github className="w-5 h-5" /></a>}
                        {profile?.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors"><Linkedin className="w-5 h-5" /></a>}
                        {profile?.twitter && <a href={profile.twitter} target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors"><Twitter className="w-5 h-5" /></a>}
                        {profile?.website && <a href={profile.website} target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors"><Globe className="w-5 h-5" /></a>}
                    </div>
                </div>
            </div>
        </div>
    );
}
