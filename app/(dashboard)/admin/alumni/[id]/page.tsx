"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Linkedin, 
    Mail, 
    MapPin, 
    Building, 
    GraduationCap, 
    MessageSquare, 
    UserPlus, 
    CheckCircle2,
    ChevronLeft,
    Clock,
    Shield
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { toast } from "react-hot-toast";

interface UserProfile {
    id: string;
    name: string;
    image: string | null;
    email: string | null;
    role: string;
    profile: {
        headline: string | null;
        currentRole: string | null;
        company: string | null;
        city: string | null;
        batch: string | null;
        department: string | null;
        bio: string | null;
        linkedin: string | null;
        skills: string[];
    } | null;
}

export default function AdminUserProfileView() {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            // We can reuse the same API, as it just fetches user data
            const res = await fetch(`/api/student/alumni/${id}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                toast.error("User not found");
                router.push("/admin/alumni");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchUser();
    }, [id]);

    if (loading) return <div className="p-10 text-center animate-pulse">Loading profile...</div>;
    if (!user) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold group text-sm"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Directory
                </button>
                <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl border border-purple-100 text-[10px] font-black uppercase tracking-widest">
                    <Shield className="w-3.5 h-3.5" /> Administrator View
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border-2 border-white shadow-lg">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-light text-primary font-black text-4xl">
                                {user.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">{user.name}</h1>
                            <p className="text-primary font-bold uppercase tracking-widest text-xs mt-1">{user.role}</p>
                        </div>

                        <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">
                            {user.profile?.headline || "Member of Alumsphere Community"}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-bold">
                            {user.profile?.city && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    {user.profile.city}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-slate-400" />
                                {user.email}
                            </div>
                            {user.profile?.batch && (
                                <div className="flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-slate-400" />
                                    {user.role === 'STUDENT' ? 'Batch' : 'Class'} of {user.profile.batch}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <button
                            onClick={() => router.push(`/admin/messages/${user.id}`)}
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary-shadow hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="w-5 h-5" /> Direct Message
                        </button>
                        
                        {user.profile?.linkedin && (
                            <a 
                                href={user.profile.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                className="px-8 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Linkedin className="w-5 h-5 text-[#0077b5]" /> LinkedIn Profile
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-4">Biography</h2>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                            {user.profile?.bio || "No biography provided yet."}
                        </p>
                    </section>

                    {user.profile?.skills && user.profile.skills.length > 0 && (
                        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900 mb-4">Expertise & Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {user.profile.skills.map((skill) => (
                                    <Badge key={skill} className="px-3 py-1.5 bg-slate-50 text-slate-700 border-slate-100 rounded-lg font-bold uppercase text-[9px] tracking-widest">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
                        <h3 className="text-lg font-black mb-6">Professional Context</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Building className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{user.role === 'ALUMNI' ? 'Current Company' : 'Institution'}</p>
                                    <p className="font-bold">{user.profile?.company || (user.role === 'STUDENT' ? 'Current Student' : 'Not Specified')}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Department</p>
                                    <p className="font-bold">{user.profile?.department || "General"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
