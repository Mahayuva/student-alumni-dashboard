import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jobSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const workMode = searchParams.get("workMode");

        const jobs = await prisma.job.findMany({
            where: {
                isActive: true,
                ...(type ? { type: type as any } : {}),
                ...(workMode ? { workMode: workMode as any } : {}),
            },
            include: {
                postedBy: {
                    select: { name: true, image: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(jobs);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only Alumni and Admin can post jobs
    if (session.user.role !== "ALUMNI" && session.user.role !== "ADMIN") {
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        const json = await req.json();
        const body = jobSchema.parse(json);

        const job = await prisma.job.create({
            data: {
                postedById: session.user.id,
                ...body,
            },
        });

        // Notify Admins
        const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
        await prisma.notification.createMany({
            data: admins.map(admin => ({
                userId: admin.id,
                title: "New Job Posted",
                message: `${session.user.name} posted a new opportunity: ${job.title} at ${job.company}`,
                link: "/admin/jobs"
            }))
        });

        // Notify Students (if active)
        if (job.isActive) {
            const students = await prisma.user.findMany({ where: { role: "STUDENT" } });
            await prisma.notification.createMany({
                data: students.map(student => ({
                    userId: student.id,
                    title: "New Job Opportunity",
                    message: `${job.title} at ${job.company} is now open for applications.`,
                    link: "/student/jobs"
                }))
            });
        }

        return NextResponse.json(job);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
