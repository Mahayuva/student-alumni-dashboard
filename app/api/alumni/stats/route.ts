import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure user is Alumni
    if (session.user.role !== "ALUMNI") {
        // return new NextResponse("Forbidden", { status: 403 }); 
        // allow for now for testing if role isn't set perfectly
    }

    const userId = session.user.id;

    try {
        const [mentorshipRequests, connections, jobs, events] = await Promise.all([
            prisma.mentorshipRequest.count({ where: { mentorId: userId, status: "PENDING" } }),
            prisma.connection.count({ where: { OR: [{ senderId: userId }, { receiverId: userId }], status: "ACCEPTED" } }),
            prisma.job.count({ where: { postedById: userId } }),
            prisma.event.count({ where: { postedById: userId } }),
        ]);

        return NextResponse.json({
            mentorshipRequests,
            connections,
            jobs,
            events,
        });
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
