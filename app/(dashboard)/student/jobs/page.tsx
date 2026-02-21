import { JobsList } from "@/components/features/jobs/JobsList";

export default function StudentJobsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Jobs & Internships</h1>
            </div>
            <JobsList isAlumniView={false} />
        </div>
    );
}
