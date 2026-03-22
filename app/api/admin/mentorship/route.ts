import { NextResponse } from "next-auth/next"; // Wait, it's next/server
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse as Response } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return Response.json({ message: "Unauthorized" }, { status: 403 });
        }

        const requests = await prisma.mentorshipRequest.findMany({
            include: {
                mentee: { select: { name: true, email: true, image: true } },
                mentor: { select: { name: true, email: true, image: true } },
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate stats
        const total = requests.length;
        const accepted = requests.filter(r => r.status === 'ACCEPTED').length;
        const pending = requests.filter(r => r.status === 'PENDING').length;

        return Response.json({
            requests,
            stats: { total, accepted, pending }
        });
    } catch (error) {
        console.error("Mentorship API Error:", error);
        return Response.json({ message: "Something went wrong" }, { status: 500 });
    }
}
