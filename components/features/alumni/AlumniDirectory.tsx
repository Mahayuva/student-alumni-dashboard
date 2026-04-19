"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, Filter, MapPin, Building, GraduationCap, Github, Linkedin, Globe } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { toast } from "react-hot-toast";

export function AlumniDirectory() {
    const [alumni, setAlumni] = useState<any[]>([]);
    const [batches, setBatches] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("all");
    const [activeTab, setActiveTab] = useState<"ALUMNI" | "STUDENT">("ALUMNI");

    const { data: session } = useSession();
    const userRole = session?.user?.role as string | undefined;
    const canDirectMessage = userRole === "INSTITUTE" || userRole === "ADMIN";

    useEffect(() => {
        fetchAlumni();
    }, [selectedBatch, activeTab]); 

    const fetchAlumni = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedBatch !== "all") params.append("batch", selectedBatch);
            params.append("role", activeTab);

            const res = await fetch(`/api/student/alumni?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setAlumni(data.alumni || []);
                if (data.batches) setBatches(data.batches);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load community directory.");
        } finally {
            setLoading(false);
        }
    };

    const filteredAlumni = alumni.filter(a => {
        const query = searchQuery.toLowerCase();
        return (
            a.name?.toLowerCase().includes(query) ||
            a.profile?.company?.toLowerCase().includes(query) ||
            a.profile?.currentRole?.toLowerCase().includes(query) ||
            a.profile?.department?.toLowerCase().includes(query)
        );
    });

    const handleConnect = async (alumId: string) => {
        try {
            const res = await fetch("/api/mentorship", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mentorId: alumId }),
            });

            if (res.ok) {
                toast.success("Mentorship request sent!");
                fetchAlumni(); 
            } else {
                toast.error("Failed to send request.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    };

    const alumniWithStatus = filteredAlumni.map(alum => {
        const request = alum.mentorshipReceived?.[0]; 
        return {
            ...alum,
            connectionStatus: request?.status || null,
        };
    });

    return (
        <div className="space-y-6">
            {/* Role Tab Switcher (Admin/Institute only) */}
            {canDirectMessage && (
                <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-fit border border-slate-200 shadow-sm backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab("ALUMNI")}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === "ALUMNI" 
                                ? "bg-white text-primary shadow-md ring-1 ring-black/5" 
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Alumni
                    </button>
                    <button
                        onClick={() => setActiveTab("STUDENT")}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === "STUDENT" 
                                ? "bg-white text-primary shadow-md ring-1 ring-black/5" 
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        Students
                    </button>
                </div>
            )}

            {/* Search and Filter Bar */}
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-blue-50/50 border border-white flex flex-col md:flex-row gap-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, company, or expertise..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 min-w-[240px] group">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                        <Filter className="text-slate-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                    </div>
                    <select
                        className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none cursor-pointer text-slate-700 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                    >
                        <option value="all">ALL BATCHES</option>
                        {batches.map(batch => (
                            <option key={batch} value={batch}>CLASS OF {batch}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading directory...</div>
            ) : filteredAlumni.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {alumniWithStatus.map((alum) => (
                        <div key={alum.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all shadow-sm group">
                            <div className="p-8">
                                <div className="flex items-start gap-5">
                                    <div className="w-20 h-20 rounded-2xl bg-zinc-50 overflow-hidden shrink-0 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                        {alum.image ? (
                                            <img src={alum.image} alt={alum.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-light text-primary font-black text-3xl">
                                                {alum.name?.charAt(0) || "U"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-xl text-slate-900 group-hover:text-primary transition-colors truncate">
                                            {alum.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-bold tracking-tight">
                                            {alum.profile?.currentRole || (activeTab === "STUDENT" ? "Student" : "Alumni")}
                                        </p>
                                        {alum.profile?.company && (
                                            <p className="text-slate-400 text-[10px] uppercase font-black mt-1">at {alum.profile.company}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    {alum.profile?.batch && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-semibold bg-primary-light/30 p-2 rounded-xl border border-primary/10">
                                            <GraduationCap className="w-4 h-4 text-primary" />
                                            <span>{activeTab === "STUDENT" ? "Batch of" : "Class of"} {alum.profile.batch}</span>
                                        </div>
                                    )}
                                    {alum.profile?.department && (
                                        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium ml-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                            <span>{alum.profile.department}</span>
                                        </div>
                                    )}
                                </div>

                                {alum.profile?.skills && alum.profile.skills.length > 0 && (
                                    <div className="mt-8 flex flex-wrap gap-2">
                                        {alum.profile.skills.slice(0, 3).map((skill: string) => (
                                            <Badge key={skill} className="px-3 py-1 text-[10px] font-bold bg-white text-slate-600 border border-slate-200 uppercase letter-wider rounded-lg">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 pt-0 flex gap-3">
                                {(alum.connectionStatus === "ACCEPTED" || canDirectMessage) ? (
                                    <Link
                                        href={`/${userRole?.toLowerCase()}/messages/${alum.id}`}
                                        className="flex-1 py-3.5 bg-primary text-white rounded-2xl text-xs font-black shadow-lg shadow-primary-shadow uppercase tracking-widest text-center hover:bg-black transition-all hover:-translate-y-0.5 active:scale-95"
                                    >
                                        Message
                                    </Link>
                                ) : alum.connectionStatus === "PENDING" ? (
                                    <button
                                        disabled
                                        className="flex-1 py-3.5 bg-slate-100 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-200 cursor-not-allowed"
                                    >
                                        Request Sent
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleConnect(alum.id)}
                                        className="flex-1 py-3.5 bg-primary text-white rounded-2xl text-xs font-black shadow-lg shadow-primary-shadow uppercase tracking-widest hover:bg-black transition-all hover:-translate-y-0.5 active:scale-95"
                                    >
                                        Connect
                                    </button>
                                )}
                                
                                <div className="flex gap-2">
                                    {alum.profile?.linkedin && (
                                        <a href={alum.profile.linkedin} target="_blank" rel="noreferrer" className="w-11 h-11 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-primary-light hover:text-primary transition-all border border-slate-100">
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900">No Members Found</h3>
                    <p className="text-slate-500">Try adjusting your filters or search query.</p>
                </div>
            )}
        </div>
    );
}
