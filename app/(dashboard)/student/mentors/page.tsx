import { MentorshipList } from "@/components/features/mentorship/MentorshipList";

export default function StudentMentorsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Mentorship Requests</h1>
            </div>
            <MentorshipList />
        </div>
    );
}
