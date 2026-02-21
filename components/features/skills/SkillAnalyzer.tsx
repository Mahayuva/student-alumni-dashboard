"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Plus, X, BarChart3, TrendingUp, AlertCircle, FileText, CheckCircle } from "lucide-react";
import { UploadResume } from "./UploadResume";
import { toast } from "react-hot-toast";

export function SkillAnalyzer() {
    const [mySkills, setMySkills] = useState<string[]>([]);
    const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
    const [missingSkills, setMissingSkills] = useState<string[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [analysisDone, setAnalysisDone] = useState(false);

    const handleUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        setAnalyzing(true);

        const formData = new FormData();
        formData.append("resume", uploadedFile);

        try {
            const res = await fetch("/api/student/skills/analyze", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setMySkills(data.extractedSkills);
                setMatchedJobs(data.matchedJobs);
                setMissingSkills(data.missingSkills);
                setAnalysisDone(true);
                toast.success("Resume analyzed successfully!");
            } else {
                toast.error("Failed to analyze resume.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
        } finally {
            setAnalyzing(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        setAnalysisDone(false);
        setMySkills([]);
        setMatchedJobs([]);
        setMissingSkills([]);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload & Skills Section */}
            <div className="lg:col-span-2 space-y-6">

                {/* Upload Area */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                        <FileText className="w-5 h-5 text-indigo-600" /> Resume Analysis
                    </h2>
                    <UploadResume
                        onUpload={handleUpload}
                        currentFile={file}
                        onRemove={removeFile}
                        isAnalyzing={analyzing}
                    />

                    <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 flex gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div className="space-y-1">
                            <p className="font-medium text-amber-800">Important Notes</p>
                            <ul className="list-disc list-inside text-amber-700 space-y-1 ml-1">
                                <li>Supported formats: <strong>PDF, TXT</strong></li>
                                <li>Maximum file size: <strong>5MB</strong></li>
                                <li>Your resume is analyzed locally and not shared with third parties.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Extracted Skills */}
                {analysisDone && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-600" /> Extracted Skills
                        </h2>
                        {mySkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {mySkills.map((skill) => (
                                    <Badge key={skill} className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500">No specific skills detected from the resume text.</p>
                        )}
                    </div>
                )}

                {/* Matched Jobs */}
                {analysisDone && matchedJobs.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-slate-800">Recommended Jobs based on your profile</h3>
                        {matchedJobs.map((job) => (
                            <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-lg text-indigo-600">{job.title}</h4>
                                        <p className="text-slate-600 font-medium">{job.company}</p>
                                        <p className="text-sm text-slate-500 mt-1">{job.location}</p>
                                    </div>
                                    <Badge className="bg-green-50 text-green-700 border-green-100">
                                        {job.matchScore}% Match
                                    </Badge>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Matched Skills:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {job.matchedSkills.slice(0, 5).map((s: string) => (
                                            <span key={s} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recommendations Section */}
            <div className="space-y-6">
                {/* Skill Gaps */}
                {analysisDone && missingSkills.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-600" /> Skill Gaps
                        </h2>
                        <p className="text-sm text-slate-500 mb-4">
                            Consider learning these skills to qualify for more roles:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {missingSkills.map((skill) => (
                                <Badge key={skill} className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100">
                                    + {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Generic Tip */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-md">
                    <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                    <p className="text-indigo-100 mb-4 text-sm">
                        Tailoring your resume keywords to specific job descriptions typically increases interview callbacks by 30%.
                    </p>
                </div>
            </div>
        </div>
    );
}
