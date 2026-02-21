import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const storySchema = z.object({
    title: z.string().min(5),
    content: z.string().min(20),
});

export async function GET(req: Request) {
    try {
        const stories = await prisma.story.findMany({
            where: {
                isApproved: true,
            },
            include: {
                author: {
                    select: { name: true, image: true, role: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(stories);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const json = await req.json();
        const body = storySchema.parse(json);

        const story = await prisma.story.create({
            data: {
                authorId: session.user.id,
                ...body,
                isApproved: true, // For now, auto-approve for testing. Change to false in prod.
            },
        });

        return NextResponse.json(story);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
