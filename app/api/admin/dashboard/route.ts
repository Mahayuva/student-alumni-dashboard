import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });
        const alumniCount = await prisma.user.count({ where: { role: "ALUMNI" } });
        const jobCount = await prisma.job.count({ where: { isActive: true } });
        const eventCount = await prisma.event.count({ where: { date: { gte: new Date() } } });

        // Pending verifications
        const pendingAlumni = await prisma.user.findMany({
            where: { role: "ALUMNI", isVerified: false },
            select: { id: true, name: true, email: true },
            take: 5
        });

        // Other basic metrics
        const placementRate = 85; // This would typically be calculated from job placements
        const dailyActiveUsers = await prisma.user.count({
            where: {
                updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }
        });

        return NextResponse.json({
            stats: {
                students: studentCount,
                alumni: alumniCount,
                jobs: jobCount,
                events: eventCount,
            },
            pendingApprovals: pendingAlumni,
            analytics: {
                placementRate,
                dailyActiveUsers
            }
        });
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
