import { AlumniDirectory } from "@/components/features/alumni/AlumniDirectory";

export default function AdminAlumniPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Community Directory</h1>
                    <p className="text-slate-500 mt-1 font-medium">As an Administrator, you have direct messaging access to all members.</p>
                </div>
            </div>
            <AlumniDirectory />
        </div>
    );
}
