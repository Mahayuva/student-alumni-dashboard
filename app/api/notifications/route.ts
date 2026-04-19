import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 20
        });

        return NextResponse.json(notifications);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id, readAll } = await req.json();

        if (readAll) {
            await prisma.notification.updateMany({
                where: { userId: session.user.id, isRead: false },
                data: { isRead: true }
            });
        } else if (id) {
            await prisma.notification.update({
                where: { id, userId: session.user.id },
                data: { isRead: true }
            });
        }

        return new NextResponse("OK");
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
