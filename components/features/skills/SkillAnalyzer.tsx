"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Plus, X, BarChart3, TrendingUp, AlertCircle, FileText, CheckCircle, ThumbsUp, ThumbsDown, Target } from "lucide-react";
import { UploadResume } from "./UploadResume";
import { toast } from "react-hot-toast";

export function SkillAnalyzer() {
    const [mySkills, setMySkills] = useState<string[]>([]);
    const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
    const [missingSkills, setMissingSkills] = useState<string[]>([]);
    const [summary, setSummary] = useState<string>("");
    const [feedback, setFeedback] = useState<string[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [analysisDone, setAnalysisDone] = useState(false);
    const [atsScore, setAtsScore] = useState<number | null>(null);
    const [atsStatus, setAtsStatus] = useState<string>("");
    const [goodPoints, setGoodPoints] = useState<string[]>([]);
    const [badPoints, setBadPoints] = useState<string[]>([]);

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
                setMySkills(data.extractedSkills || []);
                setMatchedJobs(data.matchedJobs || []);
                setMissingSkills(data.missingSkills || []);
                setSummary(data.summary || "");
                setFeedback(data.feedback || []);
                setAtsScore(data.atsScore ?? null);
                setAtsStatus(data.atsStatus || "");
                setGoodPoints(data.goodPoints || []);
                setBadPoints(data.badPoints || []);
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
        setSummary("");
        setFeedback([]);
        setAtsScore(null);
        setAtsStatus("");
        setGoodPoints([]);
        setBadPoints([]);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload & Skills Section */}
            <div className="lg:col-span-2 space-y-6">

                {/* Upload Area */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                        <FileText className="w-5 h-5 text-primary" /> Resume Analysis
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

                {/* ATS Score & Status Line */}
                {analysisDone && atsScore !== null && (
                    <div className={`p-6 rounded-xl border shadow-sm flex items-center justify-between ${atsStatus === "Pass" ? "bg-green-50 border-green-200" :
                            atsStatus === "Needs Improvement" ? "bg-amber-50 border-amber-200" :
                                "bg-red-50 border-red-200"
                        }`}>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                                <Target className={`w-6 h-6 ${atsStatus === "Pass" ? "text-green-600" :
                                        atsStatus === "Needs Improvement" ? "text-amber-600" :
                                            "text-red-600"
                                    }`} />
                                ATS Compatibility Score
                            </h2>
                            <p className="text-slate-600 text-sm">
                                Based on keywords, formatting, and structural analysis.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className={`text-3xl font-black ${atsStatus === "Pass" ? "text-green-700" :
                                        atsStatus === "Needs Improvement" ? "text-amber-700" :
                                            "text-red-700"
                                    }`}>
                                    {atsScore}<span className="text-lg opacity-70">/100</span>
                                </p>
                                <Badge className={`mt-1 ${atsStatus === "Pass" ? "bg-green-600" :
                                        atsStatus === "Needs Improvement" ? "bg-amber-600" :
                                            "bg-red-600"
                                    } text-white font-semibold`}>
                                    {atsStatus}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

                {/* Good & Bad Points */}
                {analysisDone && (goodPoints.length > 0 || badPoints.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {goodPoints.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-emerald-200 dark:border-emerald-900 shadow-sm">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-500">
                                    <ThumbsUp className="w-5 h-5" /> Strong Points
                                </h3>
                                <ul className="space-y-3">
                                    {goodPoints.map((point, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 items-start">
                                            <span className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {badPoints.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-red-200 dark:border-red-900 shadow-sm">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-500">
                                    <ThumbsDown className="w-5 h-5" /> Areas to Improve
                                </h3>
                                <ul className="space-y-3">
                                    {badPoints.map((point, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 items-start">
                                            <span className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0"></span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Extracted Skills */}
                {analysisDone && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" /> Extracted Skills
                        </h2>
                        {mySkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {mySkills.map((skill) => (
                                    <Badge key={skill} className="px-3 py-1.5 text-sm bg-primary-light text-primary border border-primary/10">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500">No specific skills detected from the resume text.</p>
                        )}
                    </div>
                )}

                {/* Summary Section */}
                {analysisDone && summary && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" /> Professional Summary
                        </h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                            {summary}
                        </p>
                    </div>
                )}

                {/* Feedback Section */}
                {analysisDone && feedback.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" /> Actionable Feedback
                        </h2>
                        <ul className="space-y-3">
                            {feedback.map((item, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 items-start">
                                    <span className="w-2 h-2 mt-1.5 rounded-full bg-green-500 shrink-0"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Matched Jobs */}
                {analysisDone && matchedJobs.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-slate-800">Recommended Jobs based on your profile</h3>
                        {matchedJobs.map((job) => (
                            <div key={job.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-lg text-primary">{job.title}</h4>
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
                <div className="bg-gradient-to-br from-primary to-primary shadow-lg shadow-primary-shadow p-6 rounded-xl text-white">
                    <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                    <p className="text-white/80 mb-4 text-sm font-medium">
                        Tailoring your resume keywords to specific job descriptions typically increases interview callbacks by 30%.
                    </p>
                </div>
            </div>
        </div>
    );
}
