import { SkillAnalyzer } from "@/components/features/skills/SkillAnalyzer";

export default function StudentSkillsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Skill Analyzer</h1>
            <p className="text-slate-500">Track and improve your professional skills based on market demand.</p>
            <SkillAnalyzer />
        </div>
    );
}
