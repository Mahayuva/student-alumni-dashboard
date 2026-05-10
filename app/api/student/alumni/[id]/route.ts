import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const alumni = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                image: true,
                email: true,
                role: true,
                profile: true,
                connectionsReceived: {
                    where: { senderId: session.user.id },
                    select: { status: true }
                },
                connectionsSent: {
                    where: { receiverId: session.user.id },
                    select: { status: true }
                }
            }
        });

        if (!alumni) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Flatten connection status
        const connection = alumni.connectionsReceived[0] || alumni.connectionsSent[0];
        const status = connection?.status || null;

        return NextResponse.json({ ...alumni, connectionStatus: status });
    } catch (error) {
        console.error("Fetch Alumni Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
