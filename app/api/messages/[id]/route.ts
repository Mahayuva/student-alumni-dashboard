import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // Fetch conversation between session.user.id and id
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    {
                        senderId: session.user.id,
                        receiverId: id,
                    },
                    {
                        senderId: id,
                        receiverId: session.user.id,
                    },
                ],
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return NextResponse.json(messages);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const json = await req.json();
        const { content } = json;

        if (!content) {
            return new NextResponse("Content is required", { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                content,
                senderId: session.user.id,
                receiverId: id,
            },
        });

        return NextResponse.json(message);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
