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

        const placedAlumniCount = await prisma.profile.count({
            where: {
                user: { role: "ALUMNI" },
                company: { not: null },
            }
        });

        const placementRate = alumniCount > 0 ? Math.round((placedAlumniCount / alumniCount) * 100) : 0;

        const dailyActiveUsers = await prisma.user.count({
            where: {
                updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }
        });

        const newRegistrations = await prisma.user.count({
            where: {
                createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }
        });

        // 7 days real data for new registrations
        const chartData: number[] = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const startOfDay = new Date(today);
            startOfDay.setDate(today.getDate() - i);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(startOfDay);
            endOfDay.setHours(23, 59, 59, 999);
            
            const count = await prisma.user.count({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });
            chartData.push(count);
        }

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
                dailyActiveUsers,
                newRegistrations,
                chartData
            }
        });
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
