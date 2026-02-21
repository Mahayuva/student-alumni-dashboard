"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Building, GraduationCap, Github, Linkedin, Globe } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { toast } from "react-hot-toast";

export function AlumniDirectory() {
    const [alumni, setAlumni] = useState<any[]>([]);
    const [batches, setBatches] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("all");

    useEffect(() => {
        fetchAlumni();
    }, [selectedBatch]); // Re-fetch when batch filter changes

    const fetchAlumni = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedBatch !== "all") params.append("batch", selectedBatch);
            // Search is handled client-side for smoother UX or can be added to params debounce

            const res = await fetch(`/api/student/alumni?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setAlumni(data.alumni);
                if (data.batches) setBatches(data.batches);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load alumni directory.");
        } finally {
            setLoading(false);
        }
    };

    // Client-side search filtering
    const filteredAlumni = alumni.filter(a => {
        const query = searchQuery.toLowerCase();
        return (
            a.name?.toLowerCase().includes(query) ||
            a.profile?.company?.toLowerCase().includes(query) ||
            a.profile?.currentRole?.toLowerCase().includes(query) ||
            a.profile?.department?.toLowerCase().includes(query)
        );
    });

    const handleConnect = (id: string) => {
        toast.success("Connection request sent!");
        // Logic to send connection request would go here
    };

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search alumni by name, company, or industry..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 min-w-[200px]">
                    <Filter className="text-slate-400 w-5 h-5 shrink-0" />
                    <select
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer text-slate-900"
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                    >
                        <option value="all">All Batches</option>
                        {batches.map(batch => (
                            <option key={batch} value={batch}>Class of {batch}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading alumni directory...</div>
            ) : filteredAlumni.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAlumni.map((alum) => (
                        <div key={alum.id} className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 transition-all shadow-sm group">
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden shrink-0 border-2 border-slate-100">
                                        {alum.image ? (
                                            <img src={alum.image} alt={alum.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-2xl">
                                                {alum.name?.charAt(0) || "A"}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {alum.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium">
                                            {alum.profile?.currentRole || "Alumni"}
                                        </p>
                                        {alum.profile?.company && (
                                            <p className="text-slate-400 text-xs">at {alum.profile.company}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {alum.profile?.company && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Building className="w-4 h-4 text-slate-400" />
                                            <span>{alum.profile.company}</span>
                                        </div>
                                    )}
                                    {(alum.profile?.city || alum.profile?.country) && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span>{[alum.profile.city, alum.profile.country].filter(Boolean).join(", ")}</span>
                                        </div>
                                    )}
                                    {alum.profile?.batch && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <GraduationCap className="w-4 h-4 text-slate-400" />
                                            <span>Class of {alum.profile.batch} • {alum.profile.department}</span>
                                        </div>
                                    )}
                                </div>

                                {alum.profile?.skills && alum.profile.skills.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-1">
                                        {alum.profile.skills.slice(0, 3).map((skill: string) => (
                                            <Badge key={skill} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 border border-slate-200">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {alum.profile.skills.length > 3 && (
                                            <span className="text-xs text-slate-400 px-1">+{alum.profile.skills.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                                <button
                                    onClick={() => handleConnect(alum.id)}
                                    className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all font-semibold"
                                >
                                    Connect
                                </button>
                                {alum.profile?.linkedin && (
                                    <a href={alum.profile.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-[#0077b5]/10 text-[#0077b5] rounded-lg hover:bg-[#0077b5]/20 transition-colors">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                )}
                                {alum.profile?.github && (
                                    <a href={alum.profile.github} target="_blank" rel="noreferrer" className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                                        <Github className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900">No Alumni Found</h3>
                    <p className="text-slate-500">Try adjusting your filters or search query.</p>
                </div>
            )}
        </div>
    );
}
