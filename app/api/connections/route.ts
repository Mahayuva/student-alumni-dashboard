import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { receiverId } = await request.json();

        if (!receiverId) {
            return new NextResponse("Receiver ID is required", { status: 400 });
        }

        if (receiverId === session.user.id) {
            return new NextResponse("Cannot connect to yourself", { status: 400 });
        }

        // Check if connection already exists
        const existing = await prisma.connection.findFirst({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId },
                    { senderId: receiverId, receiverId: session.user.id }
                ]
            }
        });

        if (existing) {
            return NextResponse.json(existing);
        }

        // Create new connection request
        const connection = await prisma.connection.create({
            data: {
                senderId: session.user.id,
                receiverId,
                status: "PENDING"
            }
        });

        // Create notification for receiver
        await prisma.notification.create({
            data: {
                userId: receiverId,
                title: "New Connection Request",
                message: `${session.user.name} wants to connect with you.`,
                link: `/student/alumni/${session.user.id}`
            }
        });

        return NextResponse.json(connection);
    } catch (error) {
        console.error("Connection Request Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
