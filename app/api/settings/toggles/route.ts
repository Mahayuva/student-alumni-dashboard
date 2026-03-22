import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                publicProfile: true,
                showEmail: true,
                showLocation: true,
                acceptMentorship: true,
                emailNotifications: true,
                jobAlerts: true,
                eventReminders: true,
                mentorshipRequests: true
            }
        });
        return NextResponse.json(user);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: body
        });
        return NextResponse.json({ success: true, user });
    } catch (e) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
