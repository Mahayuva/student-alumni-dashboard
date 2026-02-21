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
            data: { isApproved }
        });

        return NextResponse.json(updatedStory);
    } catch (e) {
        return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
    }
}
