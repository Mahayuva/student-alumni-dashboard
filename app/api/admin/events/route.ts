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
        const events = await prisma.event.findMany({
            include: {
                postedBy: {
                    select: { name: true, email: true }
                },
                _count: {
                    select: { registrations: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(events);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, ...data } = await req.json();

        const updatedEvent = await prisma.event.update({
            where: { id },
            data,
            include: { postedBy: { select: { id: true, name: true } } }
        });

        // Notify the organizer if approved
        if (data.isApproved) {
            await prisma.notification.create({
                data: {
                    userId: updatedEvent.postedById,
                    title: "Event Approved!",
                    message: `Your event "${updatedEvent.title}" has been approved by the institute.`,
                    link: "/alumni/dashboard"
                }
            });

            // Also notify students now that it's officially approved
            const students = await prisma.user.findMany({ where: { role: "STUDENT" } });
            await prisma.notification.createMany({
                data: students.map(student => ({
                    userId: student.id,
                    title: "New Event Available",
                    message: `A new event "${updatedEvent.title}" has been scheduled.`,
                    link: "/student/events"
                }))
            });
        }

        return NextResponse.json(updatedEvent);
    } catch (e) {
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
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
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        // Delete associated registrations first
        await prisma.eventRegistration.deleteMany({
            where: { eventId: id }
        });

        await prisma.event.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Event deleted successfully" });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
