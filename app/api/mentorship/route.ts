import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mentorshipRequestSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const requests = await prisma.mentorshipRequest.findMany({
            where: {
                OR: [
                    { menteeId: session.user.id },
                    { mentorId: session.user.id },
                ],
            },
            include: {
                mentee: { select: { name: true, image: true, email: true } },
                mentor: { select: { name: true, image: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(requests);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only Students can request mentorship (usually)
    if (session.user.role !== "STUDENT") {
        return new NextResponse("Only students can request mentorship", { status: 403 });
    }

    try {
        const json = await req.json();
        const body = mentorshipRequestSchema.parse(json);

        const request = await prisma.mentorshipRequest.create({
            data: {
                menteeId: session.user.id,
                ...body,
            },
        });

        return NextResponse.json(request);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
