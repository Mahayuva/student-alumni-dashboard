"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Briefcase, MapPin, Globe, Building2 } from "lucide-react";
import toast from "react-hot-toast";

const jobSchema = z.object({
    title: z.string().min(3, "Job title is required"),
    company: z.string().min(2, "Company name is required"),
    location: z.string().min(2, "Location is required"),
    type: z.enum(["Full-time", "Internship", "Freelance", "Contract"]),
    workMode: z.enum(["Remote", "Hybrid", "Onsite"]).default("Remote"),
    description: z.string().min(20, "Please provide a detailed description"),
    requirements: z.string().min(10, "Please list key requirements"),
    applyLink: z.string().url().optional().or(z.literal('')),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
    redirectPath: string;
}

export default function JobForm({ redirectPath }: JobFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<JobFormValues>({
        resolver: zodResolver(jobSchema as any),
        defaultValues: {
            workMode: "Remote",
            type: "Full-time"
        }
    });

    const onSubmit = async (data: JobFormValues) => {
        try {
            const res = await fetch("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    type: data.type.toUpperCase().replace("-", "_"),
                    workMode: data.workMode.toUpperCase(),
                }),
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            toast.success("Job/Internship Posted Successfully!");
            window.location.href = redirectPath;
        } catch (error) {
            console.error("Failed to post job:", error);
            toast.error("Failed to post job. Please try again.");
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    {...register("title")}
                                    placeholder="e.g. Software Engineer Intern"
                                    className="w-full pl-10 p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    {...register("company")}
                                    placeholder="e.g. TechCorp"
                                    className="w-full pl-10 p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            {errors.company && <p className="text-red-500 text-xs">{errors.company.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    {...register("location")}
                                    placeholder="e.g. Bangalore"
                                    className="w-full pl-10 p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <select
                                {...register("type")}
                                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Full-time">Full-time Job</option>
                                <option value="Internship">Internship</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Work Mode</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <select
                                    {...register("workMode")}
                                    className="w-full pl-10 p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="Onsite">Onsite</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            {...register("description")}
                            rows={4}
                            placeholder="Describe the role and responsibilities..."
                            className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Requirements & Skills</label>
                        <textarea
                            {...register("requirements")}
                            rows={3}
                            placeholder="List technical skills and qualifications..."
                            className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                        {errors.requirements && <p className="text-red-500 text-xs">{errors.requirements.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Application Link (Optional)</label>
                        <input
                            {...register("applyLink")}
                            placeholder="https://..."
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.applyLink && <p className="text-red-500 text-xs">{errors.applyLink.message}</p>}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
                        >
                            {isSubmitting ? "Posting..." : "Post Opportunity"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
