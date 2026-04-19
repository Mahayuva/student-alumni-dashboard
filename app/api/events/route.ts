import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { eventSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(req: Request) {
    try {
        const events = await prisma.event.findMany({
            where: {
                isApproved: true,
            },
            include: {
                postedBy: {
                    select: { name: true, image: true, email: true },
                },
            },
            orderBy: { date: "asc" },
        });

        return NextResponse.json(events);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Alumni and Admin can post events
    if (session.user.role !== "ALUMNI" && session.user.role !== "ADMIN") {
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        const json = await req.json();
        const body = eventSchema.parse(json);

        const event = await prisma.event.create({
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
                title: "New Event Posted",
                message: `${session.user.name} has posted a new event: ${event.title}`,
                link: "/admin/events"
            }))
        });

        // Notify Students (if approved)
        if (event.isApproved) {
            const students = await prisma.user.findMany({ where: { role: "STUDENT" } });
            await prisma.notification.createMany({
                data: students.map(student => ({
                    userId: student.id,
                    title: "New Event Available",
                    message: `A new event "${event.title}" has been scheduled.`,
                    link: "/student/events"
                }))
            });
        }

        return NextResponse.json(event);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
