import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";

import { Users, GraduationCap, TrendingUp } from "lucide-react";
import { AlumniInsightsCharts } from "./Charts";

export default async function AlumniInsightsPage() {
    // 1. Fetch data
    const profiles = await prisma.profile.findMany({
        where: {
            user: { role: "STUDENT" }
        }
    });

    const mentorshipRequests = await prisma.mentorshipRequest.findMany({
        orderBy: { createdAt: 'asc' }
    });

    // 2. Process Data
    const batchCounts: Record<string, number> = {};
    profiles.forEach(p => {
        if (p.batch) {
            batchCounts[p.batch] = (batchCounts[p.batch] || 0) + 1;
        }
    });

    const batchDemographics = Object.entries(batchCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => parseInt(a.name) - parseInt(b.name));

    const monthlyMentorships: Record<string, number> = {};
    mentorshipRequests.forEach(req => {
        const month = req.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyMentorships[month] = (monthlyMentorships[month] || 0) + 1;
    });

    const mentorshipStats = Object.entries(monthlyMentorships)
        .map(([date, value]) => ({ date, value }));

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-indigo-600" />
                    Student & Mentorship Insights
                </h1>
                <p className="text-slate-500 mt-2">
                    Discover demographics of students and track mentorship activity trends happening on the platform.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Students</p>
                        <p className="text-2xl font-bold text-slate-900">{profiles.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Mentorship Sessions</p>
                        <p className="text-2xl font-bold text-slate-900">{mentorshipRequests.length}</p>
                    </div>
                </div>
            </div>

            <AlumniInsightsCharts
                batchDemographics={batchDemographics}
                mentorshipStats={mentorshipStats}
            />
        </div>
    );
}
