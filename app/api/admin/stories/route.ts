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
        const stories = await prisma.story.findMany({
            include: {
                author: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(stories);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, isApproved } = await req.json();

        const updatedStory = await prisma.story.update({
            where: { id },
            data: { isApproved },
            include: { author: { select: { id: true, name: true } } }
        });

        if (isApproved) {
            // Notify the author
            await prisma.notification.create({
                data: {
                    userId: updatedStory.authorId,
                    title: "Story Approved!",
                    message: `Your story "${updatedStory.title}" has been approved and is now live.`,
                    link: "/alumni/dashboard"
                }
            });

            // Notify students
            const students = await prisma.user.findMany({ where: { role: "STUDENT" } });
            await prisma.notification.createMany({
                data: students.map(student => ({
                    userId: student.id,
                    title: "New Story Posted",
                    message: `A new inspiring story "${updatedStory.title}" is now available.`,
                    link: "/student/stories"
                }))
            });
        }

        return NextResponse.json(updatedStory);
    } catch (e) {
        return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
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
            return NextResponse.json({ error: "Story ID is required" }, { status: 400 });
        }

        await prisma.story.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Story deleted" });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
    }
}
