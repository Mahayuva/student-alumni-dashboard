import { Badge } from "@/components/ui/Badge";
import { Briefcase, Building2, MapPin, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

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
}

interface JobCardProps {
    job: Job;
    isAlumniView?: boolean;
}

export function JobCard({ job, isAlumniView = false }: JobCardProps) {
    const postedDate = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true });

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
                        {job.postedBy.image ? (
                            <img src={job.postedBy.image} alt={job.company} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            job.company.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {job.title}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">{job.company}</p>
                    </div>
                </div>
                <Badge variant={job.type === "INTERNSHIP" ? "secondary" : "default"} className={job.type === "INTERNSHIP" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"}>
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
                ) : (
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch("/api/jobs/apply", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ jobId: job.id })
                                });
                                if (res.ok) {
                                    alert("Applied successfully!");
                                } else {
                                    const err = await res.text();
                                    alert(err || "Failed to apply");
                                }
                            } catch (e) {
                                alert("Failed to apply");
                            }
                        }}
                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Apply Now
                    </button>
                )}
                <Link href={`/jobs/${job.id}`} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Details
                </Link>
            </div>
        </div>
    );
}
