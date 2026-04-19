import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const jobs = await prisma.job.findMany({
            include: {
                postedBy: {
                    select: { name: true, email: true }
                },
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(jobs);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, ...data } = await req.json();

        const updatedJob = await prisma.job.update({
            where: { id },
            data,
            include: { postedBy: { select: { id: true, name: true } } }
        });

        // Notify the poster if activated
        if (data.isActive) {
            await prisma.notification.create({
                data: {
                    userId: updatedJob.postedById,
                    title: "Job Approved!",
                    message: `Your job posting for "${updatedJob.title}" at ${updatedJob.company} is now live.`,
                    link: "/alumni/dashboard"
                }
            });

            // Also notify students
            const students = await prisma.user.findMany({ where: { role: "STUDENT" } });
            await prisma.notification.createMany({
                data: students.map(student => ({
                    userId: student.id,
                    title: "New Job Opportunity",
                    message: `${updatedJob.title} at ${updatedJob.company} is now open for applications.`,
                    link: "/student/jobs"
                }))
            });
        }

        return NextResponse.json(updatedJob);
    } catch (e) {
        return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
        }

        // Delete associated applications first if no cascade is enabled, but prisma handles it if configured
        await prisma.jobApplication.deleteMany({
            where: { jobId: id }
        });

        await prisma.job.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Job deleted successfully" });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
    }
}
