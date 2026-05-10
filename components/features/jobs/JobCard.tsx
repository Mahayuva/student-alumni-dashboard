"use client";

import { Badge } from "@/components/ui/Badge";
import { Briefcase, Building2, MapPin, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { JobApplyModal } from "./JobApplyModal";

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    workMode: string;
    salaryRange?: string | null;
    applyLink?: string | null;
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

interface JobCardProps {
    job: Job;
    isAlumniView?: boolean;
}

export function JobCard({ job, isAlumniView = false }: JobCardProps) {
    const [isApplied, setIsApplied] = useState(job.applications && job.applications.length > 0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const postedDate = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true });

    const handleApplySuccess = () => {
        setIsApplied(true);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full relative overflow-hidden">
            {isApplied && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" /> Applied
                </div>
            )}
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center text-primary font-bold text-xl shrink-0">
                        {job.postedBy.image ? (
                            <img src={job.postedBy.image} alt={job.company} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            job.company.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                            {job.title}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">{job.company}</p>
                    </div>
                </div>
                <Badge variant={job.type === "INTERNSHIP" ? "secondary" : "default"} className={job.type === "INTERNSHIP" ? "bg-primary-light text-primary hover:bg-primary/20" : "bg-primary text-white hover:bg-black"}>
                    {job.type}
                </Badge>
            </div>

            <div className="flex flex-col gap-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{job.location} ({job.workMode})</span>
                </div>
                {job.salaryRange && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <DollarSign className="w-4 h-4 shrink-0" />
                        <span>{job.salaryRange}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-slate-400 text-xs mt-auto pt-2">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>Posted {postedDate}</span>
                </div>
            </div>

            <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                {isAlumniView ? (
                    <button className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        Manage
                    </button>
                ) : isApplied ? (
                    <button
                        disabled
                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Applied
                    </button>
                ) : (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 px-4 py-2 bg-primary hover:bg-black text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary-shadow"
                    >
                        Apply Now
                    </button>
                )}
                <Link href={`/student/jobs/${job.id}`} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Details
                </Link>
            </div>
            <JobApplyModal 
                jobId={job.id}
                jobTitle={job.title}
                company={job.company}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleApplySuccess}
            />
        </div>
    );
}
