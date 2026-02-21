import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // 1. Fetch Stats
        const [jobApplicationsCount, eventsRegisteredCount, connectionsCount] = await Promise.all([
            prisma.jobApplication.count({
                where: { studentId: userId }
            }),
            prisma.eventRegistration.count({
                where: { userId: userId }
            }),
            prisma.connection.count({
                where: {
                    OR: [
                        { senderId: userId, status: "ACCEPTED" },
                        { receiverId: userId, status: "ACCEPTED" }
                    ]
                }
            })
        ]);

        // 2. Fetch Recent Activity
        // We'll fetch the most recent items from each category and sort them in code
        // Fetch last 5 of each for good measure, then merge and slice
        const [recentJobs, recentEvents, recentMentorships] = await Promise.all([
            prisma.jobApplication.findMany({
                where: { studentId: userId },
                take: 5,
                orderBy: { updatedAt: 'desc' },
                include: { job: { select: { title: true, company: true } } }
            }),
            prisma.eventRegistration.findMany({
                where: { userId: userId },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { event: { select: { title: true } } }
            }),
            prisma.mentorshipRequest.findMany({
                where: {
                    OR: [{ menteeId: userId }, { mentorId: userId }]
                },
                take: 5,
                orderBy: { updatedAt: 'desc' },
                include: {
                    mentor: { select: { name: true } },
                    mentee: { select: { name: true } }
                }
            })
        ]);

        const activities = [
            ...recentJobs.map(j => ({
                type: 'job',
                title: `Applied to ${j.job.title}`,
                desc: `${j.job.company} • ${j.status}`,
                time: j.updatedAt,
                status: j.status,
                rawDate: new Date(j.updatedAt)
            })),
            ...recentEvents.map(e => ({
                type: 'event',
                title: `Registered for ${e.event.title}`,
                desc: "Event Registration",
                time: e.createdAt,
                status: "Registered",
                rawDate: new Date(e.createdAt)
            })),
            ...recentMentorships.map(m => ({
                type: 'mentorship',
                title: `Mentorship: ${m.menteeId === userId ? m.mentor.name : m.mentee.name}`,
                desc: m.message || "No message",
                time: m.updatedAt,
                status: m.status,
                rawDate: new Date(m.updatedAt)
            }))
        ].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()).slice(0, 5);


        // 3. Fetch Upcoming Events
        const upcomingEvents = await prisma.event.findMany({
            where: {
                date: {
                    gte: new Date()
                }
            },
            take: 3,
            orderBy: { date: 'asc' },
            include: {
                _count: {
                    select: { registrations: true }
                }
            }
        });

        // 4. Fetch Latest Jobs (for widget)
        const latestJobs = await prisma.job.findMany({
            where: { isActive: true },
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                company: true,
                location: true,
                type: true
            }
        });

        // 5. Fetch Profile Data
        const profile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
            select: {
                headline: true,
                skills: true,
                batch: true,
                department: true
            }
        });

        return NextResponse.json({
            stats: {
                jobApplications: jobApplicationsCount,
                eventsRegistered: eventsRegisteredCount,
                connections: connectionsCount,
                profileViews: 0 // Not tracked yet
            },
            activities,
            upcomingEvents,
            latestJobs,
            profile
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
