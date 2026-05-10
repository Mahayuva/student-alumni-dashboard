import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcrypt";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(users);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, action, role } = await req.json();

        let data: any = {};

        if (action === "verify") {
            data.isVerified = true;
        } else if (action === "updateRole" && role) {
            data.role = role;
        } else if (action === "resetPassword") {
            // Reset to a default password: Welcome@123
            const hashedPassword = await hash("Welcome@123", 10);
            data.password = hashedPassword;
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id },
            data
        });

        return NextResponse.json(user);
    } catch (e) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
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
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        // Prevent self-deletion
        if (id === session.user.id) {
            return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
        }

        // Use a transaction to clean up all relations in the correct order
        await prisma.$transaction(async (tx) => {
            // 1. Handle Job-related dependencies
            // Delete applications to jobs posted by this user
            const userJobs = await tx.job.findMany({ where: { postedById: id }, select: { id: true } });
            const userJobIds = userJobs.map(j => j.id);
            await tx.jobApplication.deleteMany({ where: { jobId: { in: userJobIds } } });
            // Delete applications made by this user
            await tx.jobApplication.deleteMany({ where: { studentId: id } });
            // Finally delete the jobs themselves
            await tx.job.deleteMany({ where: { postedById: id } });

            // 2. Handle Event-related dependencies
            // Delete registrations for events posted by this user
            const userEvents = await tx.event.findMany({ where: { postedById: id }, select: { id: true } });
            const userEventIds = userEvents.map(e => e.id);
            await tx.eventRegistration.deleteMany({ where: { eventId: { in: userEventIds } } });
            // Delete registrations made by this user
            await tx.eventRegistration.deleteMany({ where: { userId: id } });
            // Finally delete the events themselves
            await tx.event.deleteMany({ where: { postedById: id } });

            // 3. Simple Relations (Content & Social)
            await tx.notification.deleteMany({ where: { userId: id } });
            await tx.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });
            await tx.feedback.deleteMany({ where: { userId: id } });
            await tx.story.deleteMany({ where: { authorId: id } });
            await tx.mentorshipRequest.deleteMany({ where: { OR: [{ menteeId: id }, { mentorId: id }] } });
            await tx.connection.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });
            await tx.profileView.deleteMany({ where: { OR: [{ viewerId: id }, { viewedId: id }] } });
            await tx.userBadge.deleteMany({ where: { userId: id } });
            await tx.donation.deleteMany({ where: { donorId: id } });
            await tx.profile.deleteMany({ where: { userId: id } });

            // 4. Finally delete the user
            await tx.user.delete({ where: { id } });
        });

        return NextResponse.json({ message: "User and all related data deleted successfully" });
    } catch (e) {
        console.error("Delete error:", e);
        return NextResponse.json({ error: "Failed to delete user due to active dependencies" }, { status: 500 });
    }
}
