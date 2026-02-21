import { prisma } from "@/lib/db";
import { Briefcase, Building2, MapPin, TrendingUp } from "lucide-react";
import { AnalyticsCharts } from "./Charts";

export default async function StudentAnalyticsPage() {
    // 1. Fetch data
    const profiles = await prisma.profile.findMany({
        where: {
            user: { role: "ALUMNI" },
            industry: { not: null },
            company: { not: null }
        }
    });

    const jobs = await prisma.job.findMany();

    // 2. Process data for charts

    // A. Top Industries among Alumni
    const industryCounts: Record<string, number> = {};
    profiles.forEach(p => {
        if (p.industry) {
            industryCounts[p.industry] = (industryCounts[p.industry] || 0) + 1;
        }
    });

    const topIndustries = Object.entries(industryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // B. Top Companies
    const companyCounts: Record<string, number> = {};
    profiles.forEach(p => {
        if (p.company) {
            companyCounts[p.company] = (companyCounts[p.company] || 0) + 1;
        }
    });
    const topCompanies = Object.entries(companyCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // C. Job Requirements (Skills in demand)
    const skillsCounts: Record<string, number> = {};
    jobs.forEach(j => {
        if (j.requirements) {
            // rough heuristic: split by comma or newline
            const reqs = j.requirements.split(/[\n,]/).map(r => r.trim()).filter(r => r.length > 2 && r.length < 20);
            reqs.forEach(req => {
                skillsCounts[req] = (skillsCounts[req] || 0) + 1;
            });
        }
    });

    const topSkills = Object.entries(skillsCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);


    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    Career Insights & Analytics
                </h1>
                <p className="text-slate-500 mt-2">
                    Discover data-driven insights about alumni careers, top industries, and highly requested skills.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Job Postings</p>
                        <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Alumni Registered</p>
                        <p className="text-2xl font-bold text-slate-900">{profiles.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Top Industry</p>
                        <p className="text-lg font-bold text-slate-900 truncate">{topIndustries[0]?.name || "N/A"}</p>
                    </div>
                </div>
            </div>

            <AnalyticsCharts topIndustries={topIndustries} topCompanies={topCompanies} />

            {/* In-Demand Skills */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Trending Skills (from Jobs)</h2>
                <div className="flex flex-wrap gap-3">
                    {topSkills.length > 0 ? topSkills.map((skill, i) => (
                        <div key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 transition-transform hover:scale-105">
                            <span className="font-medium text-slate-700">{skill.name}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                                {skill.count} requests
                            </span>
                        </div>
                    )) : (
                        <p className="text-slate-500">Not enough job data to extract skills.</p>
                    )}
                </div>
            </div>

        </div>
    );
}
