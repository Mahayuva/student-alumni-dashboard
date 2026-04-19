"use client";

import JobForm from "@/components/forms/JobForm";

export default function AdminPostJobPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Post Job or Internship</h1>
                <p className="text-slate-500 mt-1">Share placement opportunities or internships directly from the institute.</p>
            </div>
            <JobForm redirectPath="/admin/dashboard" />
        </div>
    );
}
