
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    try {
        const mentorships = await prisma.mentorshipRequest.findMany({
            where: { menteeId: userId },
            include: { mentor: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        const jobApplications = await prisma.jobApplication.findMany({
            where: { studentId: userId },
            include: { job: { select: { title: true, company: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        // We need to fetch event registrations. Wait, I didn't verify the `EventRegistration` model has `userId`.
        // schema.prisma: model EventRegistration { id, eventId, userId, ... } -> YES.
        const eventRegistrations = await prisma.eventRegistration.findMany({
            where: { userId: userId },
            include: { event: { select: { title: true, date: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

        const activities = [
            ...mentorships.map((m: any) => ({
                id: m.id,
                type: "mentorship",
                title: `Mentorship Request to ${m.mentor.name || 'Mentor'}`,
                date: m.createdAt,
                status: m.status,
            })),
            ...jobApplications.map((j: any) => ({
                id: j.id,
                type: "job",
                title: `Applied to ${j.job.title} at ${j.job.company}`,
                date: j.createdAt,
                status: j.status,
            })),
            ...eventRegistrations.map((e: any) => ({
                id: e.id,
                type: "event",
                title: `Registered for ${e.event.title}`,
                date: e.createdAt,
                status: "CONFIRMED",
            })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        return NextResponse.json(activities);
    } catch (error) {
        console.error("Failed to fetch activities:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
