"use client";

import { useEffect, useState } from "react";
import { JobCard } from "./JobCard";
import { Search, Filter } from "lucide-react";

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    workMode: string;
    salaryRange?: string | null;
    createdAt: string | Date;
    postedBy: {
        name: string | null;
        image: string | null;
    };
    applications?: {
        id: string;
        status: string;
        createdAt: string | Date;
    }[];
}

export function JobsList({ isAlumniView = false }: { isAlumniView?: boolean }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    const [selectedMode, setSelectedMode] = useState("");

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await fetch("/api/jobs");
                if (res.ok) {
                    const data = await res.json();
                    setJobs(data);
                }
            } catch (error) {
                console.error("Failed to fetch jobs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || job?.company?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType ? job.type === selectedType : true;
        const matchesMode = selectedMode ? job.workMode === selectedMode : true;
        return matchesSearch && matchesType && matchesMode;
    });

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search jobs by title or company..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>

            {showFilters && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Type</label>
                        <select 
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-primary outline-none"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="FULL_TIME">Full Time</option>
                            <option value="PART_TIME">Part Time</option>
                            <option value="INTERNSHIP">Internship</option>
                            <option value="CONTRACT">Contract</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Work Mode</label>
                        <select 
                            className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-primary outline-none"
                            value={selectedMode}
                            onChange={(e) => setSelectedMode(e.target.value)}
                        >
                            <option value="">All Modes</option>
                            <option value="ONSITE">On-site</option>
                            <option value="REMOTE">Remote</option>
                            <option value="HYBRID">Hybrid</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={() => { setSelectedType(""); setSelectedMode(""); }}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 font-medium"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Jobs Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No jobs found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                        <JobCard key={job.id} job={job} isAlumniView={isAlumniView} />
                    ))}
                </div>
            )}
        </div>
    );
}
