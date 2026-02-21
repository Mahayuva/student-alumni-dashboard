"use client";

import { useState, useEffect } from "react";
import { Briefcase, Search, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

export default function JobsModerationPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchJobs = async () => {
        try {
            const res = await fetch("/api/admin/jobs");
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (error) {
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const toggleJobStatus = async (id: string, currentStatus: boolean) => {
        const loadingToast = toast.loading("Updating status...");
        try {
            const res = await fetch("/api/admin/jobs", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isActive: !currentStatus })
            });

            if (res.ok) {
                toast.success("Job status updated", { id: loadingToast });
                setJobs(jobs.map(job =>
                    job.id === id ? { ...job, isActive: !currentStatus } : job
                ));
            } else {
                toast.error("Update failed", { id: loadingToast });
            }
        } catch (error) {
            toast.error("Update failed", { id: loadingToast });
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.postedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Briefcase className="w-8 h-8 text-blue-500" /> Jobs Moderation
                </h1>
                <p className="text-slate-500 mt-1">Review and approve job postings submitted by Alumni partners.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search jobs or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                                <th className="p-4">Job Title & Company</th>
                                <th className="p-4">Posted By</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading jobs...</td>
                                </tr>
                            ) : filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">No jobs found.</td>
                                </tr>
                            ) : (
                                filteredJobs.map(job => (
                                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-800">{job.title}</div>
                                            <div className="text-sm text-slate-500">{job.company} • {job.location}</div>
                                            <div className="text-xs text-slate-400 mt-1">{job.type.replace("_", " ")}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium text-slate-800">{job.postedBy?.name || "Unknown"}</div>
                                            <div className="text-xs text-slate-500">{job.postedBy?.email}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={job.isActive ? "default" : "secondary"} className={job.isActive ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"}>
                                                {job.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => toggleJobStatus(job.id, job.isActive)}
                                                    className={`p-2 rounded-lg transition-colors ${job.isActive
                                                            ? 'text-red-600 hover:bg-red-50 bg-white border border-slate-200'
                                                            : 'text-green-600 hover:bg-green-50 bg-white border border-slate-200'
                                                        }`}
                                                    title={job.isActive ? "Deactivate Job" : "Activate Job"}
                                                >
                                                    {job.isActive ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
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
