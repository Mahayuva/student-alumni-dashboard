"use client";

import { JobsList } from "@/components/features/jobs/JobsList";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AlumniJobsPage() {
    const { data: session } = useSession();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Manage Jobs</h1>
                <Link href="/alumni/jobs/create">
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                        <Plus className="w-5 h-5" /> Post a Job
                    </button>
                </Link>
            </div>
            <JobsList isAlumniView={true} />
        </div>
    );
}
