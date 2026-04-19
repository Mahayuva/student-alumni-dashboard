"use client";

import JobForm from "@/components/forms/JobForm";

export default function AlumniPostJobPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Post a Job or Internship</h1>
                <p className="text-slate-500 mt-1">Help students start their careers by sharing opportunities from your network.</p>
            </div>
            <JobForm redirectPath="/alumni/dashboard" />
        </div>
    );
}
