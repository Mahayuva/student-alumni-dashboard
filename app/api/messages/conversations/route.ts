import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db"; // ENSURED: Importing from lib/db

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch conversations using Prisma
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: session.user.id },
                    { receiverId: session.user.id },
                ],
            },
            include: {
                sender: { select: { id: true, name: true, image: true, role: true } },
                receiver: { select: { id: true, name: true, image: true, role: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const conversations: any[] = [];
        const seenUsers = new Set();

        for (const msg of messages) {
            const otherUser = msg.senderId === session.user.id ? msg.receiver : msg.sender;
            
            if (otherUser && !seenUsers.has(otherUser.id)) {
                seenUsers.add(otherUser.id);
                conversations.push({
                    id: otherUser.id,
                    name: otherUser.name,
                    image: otherUser.image,
                    role: otherUser.role,
                    lastMessage: msg.content,
                    time: msg.createdAt,
                    unread: msg.receiverId === session.user.id && !msg.isRead,
                });
            }
        }

        return NextResponse.json(conversations);
    } catch (error) {
        console.error("Conversations Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
    }
}
