import { AlumniDirectory } from "@/components/features/alumni/AlumniDirectory";

export default function StudentAlumniPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Alumni Directory</h1>
            </div>
            <AlumniDirectory />
        </div>
    );
}
