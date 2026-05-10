"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Briefcase, 
    Building2, 
    MapPin, 
    DollarSign, 
    Clock, 
    Calendar, 
    ChevronLeft, 
    CheckCircle2, 
    ArrowRight,
    Share2,
    Bookmark
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { JobApplyModal } from "@/components/features/jobs/JobApplyModal";

interface Job {
    id: string;
    title: string;
    company: string;
    description: string;
    location: string;
    type: string;
    workMode: string;
    salaryRange?: string | null;
    requirements?: string | null;
    createdAt: string | Date;
    postedBy: {
        name: string | null;
        image: string | null;
        email: string | null;
        profile?: {
            headline: string | null;
            company: string | null;
        }
    };
    applications?: {
        id: string;
        status: string;
        createdAt: string | Date;
        degree?: string | null;
        skills?: string | null;
        coverNote?: string | null;
    }[];
}

export default function JobDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/jobs/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setJob(data);
                } else {
                    router.push("/student/jobs");
                }
            } catch (error) {
                console.error("Failed to fetch job", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchJob();
    }, [id, router]);

    const handleApply = async () => {
        setIsApplying(true);
        try {
            const res = await fetch("/api/jobs/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId: id })
            });
            if (res.ok) {
                const updatedJob = await (await fetch(`/api/jobs/${id}`)).json();
                setJob(updatedJob);
            } else {
                const err = await res.text();
                alert(err || "Failed to apply");
            }
        } catch (e) {
            alert("Failed to apply");
        } finally {
            setIsApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse">
                <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
                <div className="h-64 bg-slate-200 rounded-2xl"></div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
                    <div className="h-96 bg-slate-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!job) return null;

    const isApplied = job.applications && job.applications.length > 0;
    const applicationData = isApplied ? job.applications![0] : null;
    const applicationDate = applicationData ? new Date(applicationData.createdAt) : null;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Back Button */}
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Jobs
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                
                <div className="relative flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-20 h-20 rounded-2xl bg-primary-light flex items-center justify-center text-primary font-bold text-3xl shadow-inner">
                        {job.postedBy.image ? (
                            <img src={job.postedBy.image} alt={job.company} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            job.company.charAt(0).toUpperCase()
                        )}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                                {job.title}
                            </h1>
                            <Badge className="bg-primary-light text-primary border-none px-4 py-1.5 text-sm font-semibold">
                                {job.type}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap gap-y-3 gap-x-6">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Building2 className="w-5 h-5 text-slate-400" />
                                <span className="font-semibold">{job.company}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <MapPin className="w-5 h-5 text-slate-400" />
                                <span>{job.location} ({job.workMode})</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Clock className="w-5 h-5 text-slate-400" />
                                <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="p-3 border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all">
                            <Bookmark className="w-6 h-6" />
                        </button>
                        <button className="p-3 border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all">
                            <Share2 className="w-6 h-6" />
                        </button>
                        {isApplied ? (
                            <div className="flex-1 md:flex-none flex flex-col items-end">
                                <button
                                    disabled
                                    className="w-full px-8 py-3.5 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold flex items-center justify-center gap-2 cursor-default"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> Applied
                                </button>
                                <p className="text-[10px] text-slate-400 mt-1 font-medium italic">
                                    Applied on {format(applicationDate!, "MMM dd, yyyy 'at' hh:mm a")}
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex-1 md:flex-none px-8 py-3.5 bg-primary hover:bg-black text-white rounded-xl font-bold transition-all shadow-xl shadow-primary-shadow flex items-center justify-center gap-2 group"
                            >
                                Apply Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Your Application Section */}
                    {isApplied && (
                        <section className="bg-primary/5 rounded-3xl p-6 border border-primary/20 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    Your Application
                                </h2>
                                <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-100">
                                    Applied {format(applicationDate!, "MMM dd, yyyy")}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Degree / Qualification</p>
                                    <p className="text-slate-700 font-semibold">{applicationData?.degree || "Not specified"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills & Experience</p>
                                    <p className="text-slate-700 font-semibold">{applicationData?.skills || "Not specified"}</p>
                                </div>
                            </div>

                            {applicationData?.coverNote && (
                                <div className="space-y-2 pt-4 border-t border-primary/10">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cover Note</p>
                                    <p className="text-slate-600 text-sm italic leading-relaxed bg-white/50 p-4 rounded-2xl">
                                        "{applicationData.coverNote}"
                                    </p>
                                </div>
                            )}
                        </section>
                    )}

                    <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-primary" />
                            Job Description
                        </h2>
                        <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {job.description}
                        </div>
                    </section>

                    {job.requirements && (
                        <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Requirements</h2>
                            <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {job.requirements}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Key Stats */}
                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
                        <h3 className="text-lg font-bold mb-6">Job Overview</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-medium">Salary Range</p>
                                    <p className="font-bold">{job.salaryRange || "Not Disclosed"}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-medium">Date Posted</p>
                                    <p className="font-bold">{format(new Date(job.createdAt), "MMM dd, yyyy")}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-medium">Job Type</p>
                                    <p className="font-bold capitalize">{job.type.replace("_", " ")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Poster Info */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-slate-900 font-bold mb-4">Posted By</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                {job.postedBy.image ? (
                                    <img src={job.postedBy.image} alt={job.postedBy.name || ""} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="text-primary font-bold">{job.postedBy.name?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-slate-900 truncate">{job.postedBy.name}</p>
                                <p className="text-xs text-slate-500 truncate">{job.postedBy.profile?.headline || "Alumni Member"}</p>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-bold transition-colors">
                            View Profile
                        </button>
                    </div>
                </div>
            </div>
            <JobApplyModal 
                jobId={job.id}
                jobTitle={job.title}
                company={job.company}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={async () => {
                    const updatedJob = await (await fetch(`/api/jobs/${id}`)).json();
                    setJob(updatedJob);
                }}
            />
        </div>
    );
}
